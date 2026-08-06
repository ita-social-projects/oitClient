import type {
  CreateOfficialAnswerRequest,
  QuestionMessageType,
  QuestionReviewInboxItemResponseDTO,
  QuestionState,
  QuestionStatus,
  QuestionVisibility,
  ReviewScope,
} from '@shared/models/forum';
import type { UserRole } from '@shared/models/user';
import { forumKeys } from '@shared/query/forumKeys';
import {
  applyParticipantMessageCreated,
  mergePendingParticipantMessages,
  PARTICIPANT_MESSAGE_PAGE_SIZE,
} from '@shared/query/participantForumCache';
import {
  applyReviewQuestionSnapshot,
  REVIEW_PAGE_SIZE,
} from '@shared/query/reviewQueueCache';
import { forumService, reviewForumService } from '@shared/services/forumService';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import {
  getForumErrorMessage,
  getForumErrorStatus,
  retryForumQuery,
} from '@shared/utils/forumError';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ForumPagination } from '../../user/Forum/ForumPagination';

type ReviewTab = 'inbox' | 'assigned';

const STATUS_STYLES: Record<QuestionStatus, string> = {
  NEW: 'bg-sky-100 text-sky-800',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  ANSWERED: 'bg-emerald-100 text-emerald-800',
};

const VISIBILITY_STYLES: Record<QuestionVisibility, string> = {
  PRIVATE: 'bg-slate-100 text-slate-700',
  PUBLIC: 'bg-violet-100 text-violet-800',
};

const STATE_STYLES: Record<QuestionState, string> = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-rose-100 text-rose-800',
};

const MESSAGE_STYLES: Record<QuestionMessageType, string> = {
  COMMENT: 'border-slate-200 bg-white',
  OFFICIAL_ANSWER: 'border-emerald-300 bg-emerald-50',
};

const badgeClassName = (style: string) =>
  `rounded-full px-2.5 py-1 text-xs font-semibold ${style}`;

const getReviewScope = (role: UserRole | undefined): ReviewScope | null => {
  if (role === 'ADMIN') {
    return 'admin' as const;
  }

  if (role === 'ORG') {
    return 'org' as const;
  }

  return null;
};

export default function ReviewQueuePage() {
  const { t, i18n } = useTranslation('forum');
  const queryClient = useQueryClient();
  const user = useAuth((state: AuthState) => state.user);
  const scope: ReviewScope | null = getReviewScope(user?.role);
  const [tab, setTab] = useState<ReviewTab>('inbox');
  const [page, setPage] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [messagePage, setMessagePage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOfficialAnswerRequest>({
    defaultValues: { content: '' },
  });

  const queueQuery = useQuery({
    queryKey:
      tab === 'inbox'
        ? forumKeys.reviewInbox(scope ?? 'admin', user?.id ?? 0, page, REVIEW_PAGE_SIZE)
        : forumKeys.reviewAssigned(
            scope ?? 'admin',
            user?.id ?? 0,
            page,
            REVIEW_PAGE_SIZE,
          ),
    queryFn: () =>
      tab === 'inbox'
        ? reviewForumService.getInbox(scope!, {
            page,
            size: REVIEW_PAGE_SIZE,
          })
        : reviewForumService.getAssignedQuestions(scope!, {
            page,
            size: REVIEW_PAGE_SIZE,
          }),
    enabled: user !== null && scope !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
    placeholderData: keepPreviousData,
  });

  const questionQuery = useQuery({
    queryKey: forumKeys.question(user?.id ?? 0, selectedQuestionId ?? 0),
    queryFn: () => forumService.getQuestionDetails(selectedQuestionId!),
    enabled: user !== null && selectedQuestionId !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
  });

  const messagesQuery = useQuery({
    queryKey: forumKeys.messages(
      user?.id ?? 0,
      selectedQuestionId ?? 0,
      messagePage,
      PARTICIPANT_MESSAGE_PAGE_SIZE,
    ),
    queryFn: async () => {
      const history = await forumService.getQuestionMessages(
        selectedQuestionId!,
        {
          page: messagePage,
          size: PARTICIPANT_MESSAGE_PAGE_SIZE,
        },
      );

      return mergePendingParticipantMessages(
        queryClient,
        user!.id,
        selectedQuestionId!,
        history,
      );
    },
    enabled:
      user !== null &&
      selectedQuestionId !== null &&
      questionQuery.isSuccess,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
    placeholderData: keepPreviousData,
  });

  const claimMutation = useMutation({
    mutationFn: (item: QuestionReviewInboxItemResponseDTO) =>
      reviewForumService.claimQuestion(scope!, item.id, {
        version: item.version,
      }),
    onSuccess: (question) => {
      applyReviewQuestionSnapshot(queryClient, scope!, user!.id, question);
      setSelectedQuestionId(question.id);
      setMessagePage(0);
      setTab('assigned');
      setPage(0);
    },
  });

  const officialAnswerMutation = useMutation({
    mutationFn: (request: CreateOfficialAnswerRequest) =>
      reviewForumService.publishOfficialAnswer(
        scope!,
        selectedQuestionId!,
        request,
      ),
    onSuccess: (message) => {
      const targetPage = applyParticipantMessageCreated(
        queryClient,
        user!.id,
        message,
      );

      reset();

      if (targetPage !== null) {
        setMessagePage(targetPage);
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: QuestionStatus) =>
      reviewForumService.updateQuestionStatus(scope!, selectedQuestionId!, {
        status,
        version: questionQuery.data!.version,
      }),
    onSuccess: (question) =>
      applyReviewQuestionSnapshot(queryClient, scope!, user!.id, question),
  });

  const visibilityMutation = useMutation({
    mutationFn: (visibility: QuestionVisibility) =>
      reviewForumService.updateQuestionVisibility(scope!, selectedQuestionId!, {
        visibility,
        version: questionQuery.data!.version,
      }),
    onSuccess: (question) =>
      applyReviewQuestionSnapshot(queryClient, scope!, user!.id, question),
  });

  const stateMutation = useMutation({
    mutationFn: (state: QuestionState) =>
      reviewForumService.updateQuestionState(scope!, selectedQuestionId!, {
        state,
        version: questionQuery.data!.version,
      }),
    onSuccess: (question) =>
      applyReviewQuestionSnapshot(queryClient, scope!, user!.id, question),
  });

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language],
  );

  const selectQuestion = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setMessagePage(0);
    claimMutation.reset();
    officialAnswerMutation.reset();
    statusMutation.reset();
    visibilityMutation.reset();
    stateMutation.reset();
  };

  const changeTab = (nextTab: ReviewTab) => {
    setTab(nextTab);
    setPage(0);
    setSelectedQuestionId(null);
    setMessagePage(0);
  };

  const submitOfficialAnswer = handleSubmit((values) => {
    officialAnswerMutation.reset();
    officialAnswerMutation.mutate({ content: values.content.trim() });
  });

  if (!user || !scope) {
    return null;
  }

  const selectedQueueItem = queueQuery.data?.content.find(
    (item) => item.id === selectedQuestionId,
  );
  const question = questionQuery.data;
  const canManageQuestion =
    question !== undefined && question.assignedReviewerId === user.id;
  const canClaimQuestion =
    question !== undefined &&
    question.state === 'OPEN' &&
    question.status === 'NEW' &&
    question.assignedReviewerId === null &&
    (scope === 'admin' || selectedQueueItem !== undefined);
  const actionError =
    claimMutation.error ??
    officialAnswerMutation.error ??
    statusMutation.error ??
    visibilityMutation.error ??
    stateMutation.error;
  const actionErrorStatus = getForumErrorStatus(actionError);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-6 md:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          {scope === 'admin' ? t('review.adminScope') : t('review.orgScope')}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('review.title')}
        </h1>
        <p className="mt-2 text-slate-600">{t('review.description')}</p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {(['inbox', 'assigned'] as const).map((reviewTab) => (
          <button
            key={reviewTab}
            type="button"
            className={`border-b-2 px-4 py-3 font-semibold transition ${
              tab === reviewTab
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => changeTab(reviewTab)}
          >
            {t(`review.tabs.${reviewTab}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t(`review.tabs.${tab}`)}
              </h2>
              {queueQuery.data && (
                <p className="mt-1 text-sm text-slate-600">
                  {t('review.total', { count: queueQuery.data.totalElements })}
                </p>
              )}
            </div>
            {queueQuery.isFetching && (
              <span className="text-sm text-slate-500">
                {t('list.refreshing')}
              </span>
            )}
          </div>

          {queueQuery.isPending ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              {t('review.loading')}
            </div>
          ) : queueQuery.isError ? (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
              <p>
                {getForumErrorMessage(
                  queueQuery.error,
                  t('review.errors.loadFailed'),
                )}
              </p>
              <button
                type="button"
                className="mt-3 font-semibold underline"
                onClick={() => void queueQuery.refetch()}
              >
                {t('actions.retry')}
              </button>
            </section>
          ) : !queueQuery.data || queueQuery.data.content.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {t(`review.empty.${tab}Title`)}
              </h3>
              <p className="mt-2 text-slate-600">
                {t(`review.empty.${tab}Description`)}
              </p>
            </section>
          ) : (
            <div className="flex flex-col gap-3">
              {queueQuery.data?.content.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    selectedQuestionId === item.id
                      ? 'border-blue-400 ring-2 ring-blue-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {t('review.taskAssignment', {
                          id: item.taskAssignmentId,
                        })}
                      </p>
                      <h3 className="mt-1 break-words text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={badgeClassName(STATUS_STYLES[item.status])}>
                        {t(`status.${item.status}`)}
                      </span>
                      <span
                        className={badgeClassName(
                          VISIBILITY_STYLES[item.visibility],
                        )}
                      >
                        {t(`visibility.${item.visibility}`)}
                      </span>
                      <span className={badgeClassName(STATE_STYLES[item.state])}>
                        {t(`state.${item.state}`)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <span>
                      {t('review.createdAt', {
                        date: dateFormatter.format(new Date(item.createdAt)),
                      })}
                    </span>
                    <span>{t('review.version', { version: item.version })}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {(tab === 'assigned' || scope === 'admin') && (
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50"
                        onClick={() => selectQuestion(item.id)}
                      >
                        {t('review.actions.open')}
                      </button>
                    )}
                    {tab === 'inbox' && (
                      <button
                        type="button"
                        className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={claimMutation.isPending}
                        onClick={() => claimMutation.mutate(item)}
                      >
                        {claimMutation.isPending &&
                        claimMutation.variables?.id === item.id
                          ? t('review.actions.claiming')
                          : t('review.actions.claim')}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {queueQuery.data && (
            <ForumPagination
              pageNumber={queueQuery.data.pageNumber}
              totalPages={queueQuery.data.totalPages}
              first={queueQuery.data.first}
              last={queueQuery.data.last}
              disabled={queueQuery.isFetching}
              onPageChange={setPage}
            />
          )}
        </section>

        <section className="min-w-0">
          {selectedQuestionId === null ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              {t('review.selectQuestion')}
            </div>
          ) : questionQuery.isPending ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              {t('thread.loading')}
            </div>
          ) : questionQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
              <p>
                {getForumErrorMessage(
                  questionQuery.error,
                  t('review.errors.questionFailed'),
                )}
              </p>
              <button
                type="button"
                className="mt-3 font-semibold underline"
                onClick={() => void questionQuery.refetch()}
              >
                {t('actions.retry')}
              </button>
            </div>
          ) : question ? (
            <div className="flex flex-col gap-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                      {t('thread.questionNumber', { id: question.id })}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      {question.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={badgeClassName(STATUS_STYLES[question.status])}
                    >
                      {t(`status.${question.status}`)}
                    </span>
                    <span
                      className={badgeClassName(
                        VISIBILITY_STYLES[question.visibility],
                      )}
                    >
                      {t(`visibility.${question.visibility}`)}
                    </span>
                    <span className={badgeClassName(STATE_STYLES[question.state])}>
                      {t(`state.${question.state}`)}
                    </span>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-slate-800">
                  {question.content}
                </p>
                <dl className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">{t('review.author')}</dt>
                    <dd>#{question.authorId}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">{t('review.reviewer')}</dt>
                    <dd>
                      {question.assignedReviewerId === null
                        ? t('review.unassigned')
                        : `#${question.assignedReviewerId}`}
                    </dd>
                  </div>
                </dl>

                {scope === 'admin' && (
                  <Link
                    className="mt-5 inline-flex rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    to={`/profile/forum/responders/${question.taskAssignmentId}`}
                  >
                    {t('review.actions.manageResponders')}
                  </Link>
                )}
              </article>

              {canClaimQuestion && selectedQueueItem && (
                <button
                  type="button"
                  className="self-start rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={claimMutation.isPending}
                  onClick={() => claimMutation.mutate(selectedQueueItem)}
                >
                  {claimMutation.isPending
                    ? t('review.actions.claiming')
                    : t('review.actions.claim')}
                </button>
              )}

              {canManageQuestion && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {t('review.moderation.title')}
                  </h3>

                  <div className="mt-5 flex flex-col gap-5">
                    <div>
                      <p className="font-medium text-slate-800">
                        {t('review.moderation.status')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(['NEW', 'IN_REVIEW', 'ANSWERED'] as const).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              disabled={
                                question.status === status ||
                                statusMutation.isPending
                              }
                              onClick={() => statusMutation.mutate(status)}
                            >
                              {t(`status.${status}`)}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={visibilityMutation.isPending}
                        onClick={() =>
                          visibilityMutation.mutate(
                            question.visibility === 'PUBLIC'
                              ? 'PRIVATE'
                              : 'PUBLIC',
                          )
                        }
                      >
                        {question.visibility === 'PUBLIC'
                          ? t('review.actions.makePrivate')
                          : t('review.actions.makePublic')}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={stateMutation.isPending}
                        onClick={() =>
                          stateMutation.mutate(
                            question.state === 'OPEN' ? 'CLOSED' : 'OPEN',
                          )
                        }
                      >
                        {question.state === 'OPEN'
                          ? t('review.actions.close')
                          : t('review.actions.reopen')}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {t('messages.title')}
                </h3>

                {messagesQuery.isPending ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    {t('messages.loading')}
                  </div>
                ) : messagesQuery.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
                    <p>
                      {getForumErrorMessage(
                        messagesQuery.error,
                        t('errors.messagesFailed'),
                      )}
                    </p>
                    <button
                      type="button"
                      className="mt-3 font-semibold underline"
                      onClick={() => void messagesQuery.refetch()}
                    >
                      {t('actions.retry')}
                    </button>
                  </div>
                ) : !messagesQuery.data || messagesQuery.data.content.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                    {t('messages.emptyDescription')}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messagesQuery.data?.content.map((message) => (
                      <article
                        key={message.id}
                        className={`rounded-2xl border p-5 ${MESSAGE_STYLES[message.type]}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-semibold text-slate-800">
                            {message.type === 'OFFICIAL_ANSWER'
                              ? t('messages.officialAnswer')
                              : message.authorId === user.id
                                ? t('messages.you')
                                : t('messages.participant')}
                          </span>
                          <time
                            className="text-sm text-slate-500"
                            dateTime={message.createdAt}
                          >
                            {dateFormatter.format(new Date(message.createdAt))}
                          </time>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-slate-800">
                          {message.content}
                        </p>
                      </article>
                    ))}
                  </div>
                )}

                {messagesQuery.data && (
                  <ForumPagination
                    pageNumber={messagesQuery.data.pageNumber}
                    totalPages={messagesQuery.data.totalPages}
                    first={messagesQuery.data.first}
                    last={messagesQuery.data.last}
                    disabled={messagesQuery.isFetching}
                    onPageChange={setMessagePage}
                  />
                )}
              </section>

              {canManageQuestion && question.state === 'OPEN' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {t('review.answer.title')}
                  </h3>
                  <form
                    className="mt-4 flex flex-col gap-3"
                    onSubmit={submitOfficialAnswer}
                  >
                    <textarea
                      className="min-h-32 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      maxLength={10_000}
                      {...register('content', {
                        required: t('review.validation.answerRequired'),
                        maxLength: {
                          value: 10_000,
                          message: t('validation.contentMax'),
                        },
                        validate: (value: string) =>
                          value.trim().length > 0 ||
                          t('review.validation.answerRequired'),
                      })}
                    />
                    {errors.content && (
                      <span className="text-sm text-rose-700">
                        {errors.content.message}
                      </span>
                    )}
                    <button
                      type="submit"
                      className="self-start rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={officialAnswerMutation.isPending}
                    >
                      {officialAnswerMutation.isPending
                        ? t('review.answer.publishing')
                        : t('review.answer.publish')}
                    </button>
                  </form>
                </section>
              )}

              {actionError && (
                <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
                  <p>
                    {actionErrorStatus === 409
                      ? t('review.errors.conflict')
                      : actionErrorStatus === 404
                        ? t('review.errors.notFound')
                        : actionErrorStatus === 403
                          ? t('review.errors.forbidden')
                          : getForumErrorMessage(
                              actionError,
                              t('review.errors.actionFailed'),
                            )}
                  </p>
                </section>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
