import type {
  CreateCommentRequest,
  QuestionMessageType,
  QuestionState,
  QuestionStatus,
  QuestionVisibility,
} from '@shared/models/forum';
import { forumKeys } from '@shared/query/forumKeys';
import { forumDestinations } from '@shared/realtime/forumDestinations';
import { useForumSubscription } from '@shared/realtime/useForumSubscription';
import { forumService } from '@shared/services/forumService';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import {
  getForumErrorMessage,
  getForumErrorStatus,
  parsePositiveRouteId,
  retryForumQuery,
} from '@shared/utils/forumError';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ForumPagination } from './ForumPagination';

const MESSAGE_PAGE_SIZE = 50;

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

export default function QuestionThreadPage() {
  const { t, i18n } = useTranslation('forum');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { questionId: questionIdParam } = useParams();
  const questionId = parsePositiveRouteId(questionIdParam);
  const userId = useAuth((state: AuthState) => state.user?.id);
  const [messagePage, setMessagePage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentRequest>({
    defaultValues: {
      content: '',
    },
  });

  const questionQuery = useQuery({
    queryKey: forumKeys.question(userId ?? 0, questionId ?? 0),
    queryFn: () => forumService.getQuestionDetails(questionId!),
    enabled: userId !== undefined && questionId !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
  });

  useForumSubscription(
    questionQuery.data?.visibility === 'PUBLIC'
      ? forumDestinations.publicQuestion(questionQuery.data.id)
      : null,
  );

  const messagesQuery = useQuery({
    queryKey: forumKeys.messages(
      userId ?? 0,
      questionId ?? 0,
      messagePage,
      MESSAGE_PAGE_SIZE,
    ),
    queryFn: () =>
      forumService.getQuestionMessages(questionId!, {
        page: messagePage,
        size: MESSAGE_PAGE_SIZE,
      }),
    enabled: questionQuery.isSuccess && userId !== undefined && questionId !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
    placeholderData: keepPreviousData,
  });

  const commentMutation = useMutation({
    mutationFn: (request: CreateCommentRequest) => forumService.addComment(questionId!, request),
    onSuccess: () => {
      const newTotal = (messagesQuery.data?.totalElements ?? 0) + 1;
      const lastPage = Math.max(0, Math.ceil(newTotal / MESSAGE_PAGE_SIZE) - 1);

      reset();
      setMessagePage(lastPage);
      void queryClient.invalidateQueries({
        queryKey: forumKeys.messageLists(userId!, questionId!),
      });
    },
    onError: (error) => {
      if (getForumErrorStatus(error) === 409) {
        void queryClient.invalidateQueries({
          queryKey: forumKeys.question(userId!, questionId!),
        });
      }
    },
  });

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language],
  );

  const submitComment = handleSubmit((values) => {
    commentMutation.reset();
    commentMutation.mutate({
      content: values.content.trim(),
    });
  });

  if (questionId === null) {
    return (
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-semibold text-rose-900">{t('errors.notFoundTitle')}</h1>
          <p className="mt-2 text-rose-800">{t('errors.invalidQuestion')}</p>
          <button
            type="button"
            className="mt-4 font-semibold text-rose-900 underline"
            onClick={() => navigate(-1)}
          >
            {t('actions.goBack')}
          </button>
        </section>
      </main>
    );
  }

  if (questionQuery.isPending) {
    return (
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {t('thread.loading')}
        </div>
      </main>
    );
  }

  if (questionQuery.isError) {
    const status = getForumErrorStatus(questionQuery.error);
    const isForbidden = status === 403;
    const isNotFound = status === 404;

    return (
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-semibold text-rose-900">
            {isForbidden
              ? t('errors.forbiddenTitle')
              : isNotFound
                ? t('errors.notFoundTitle')
                : t('errors.loadFailedTitle')}
          </h1>
          <p className="mt-2 text-rose-800">
            {isForbidden
              ? t('errors.forbiddenQuestion')
              : isNotFound
                ? t('errors.questionNotFound')
                : getForumErrorMessage(questionQuery.error, t('errors.loadFailed'))}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!isForbidden && !isNotFound && (
              <button
                type="button"
                className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800"
                onClick={() => void questionQuery.refetch()}
              >
                {t('actions.retry')}
              </button>
            )}
            <button
              type="button"
              className="rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-900"
              onClick={() => navigate(-1)}
            >
              {t('actions.goBack')}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const question = questionQuery.data;
  const commentErrorStatus = getForumErrorStatus(commentMutation.error);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
      <Link
        className="self-start font-semibold text-blue-700 hover:underline"
        to={`/task-assignments/${question.taskAssignmentId}/forum`}
      >
        ← {t('actions.backToForum')}
      </Link>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              {t('thread.questionNumber', { id: question.id })}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{question.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={badgeClassName(STATUS_STYLES[question.status])}>
              {t(`status.${question.status}`)}
            </span>
            <span className={badgeClassName(VISIBILITY_STYLES[question.visibility])}>
              {t(`visibility.${question.visibility}`)}
            </span>
            <span className={badgeClassName(STATE_STYLES[question.state])}>
              {t(`state.${question.state}`)}
            </span>
          </div>
        </div>

        <p className="mt-6 whitespace-pre-wrap text-slate-800">{question.content}</p>
        <p className="mt-6 text-sm text-slate-500">
          {t('thread.createdAt', {
            date: dateFormatter.format(new Date(question.createdAt)),
          })}
        </p>
      </article>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t('messages.title')}</h2>
            {messagesQuery.data && (
              <p className="mt-1 text-sm text-slate-600">
                {t('messages.total', { count: messagesQuery.data.totalElements })}
              </p>
            )}
          </div>
          {messagesQuery.isFetching && (
            <span className="text-sm text-slate-500">{t('messages.refreshing')}</span>
          )}
        </div>

        {messagesQuery.isPending ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            {t('messages.loading')}
          </div>
        ) : messagesQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <p>
              {getForumErrorStatus(messagesQuery.error) === 403
                ? t('errors.forbiddenQuestion')
                : getForumErrorStatus(messagesQuery.error) === 404
                  ? t('errors.questionNotFound')
                  : getForumErrorMessage(messagesQuery.error, t('errors.messagesFailed'))}
            </p>
            <button
              type="button"
              className="mt-3 font-semibold underline"
              onClick={() => void messagesQuery.refetch()}
            >
              {t('actions.retry')}
            </button>
          </div>
        ) : messagesQuery.data.content.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-800">{t('messages.emptyTitle')}</h3>
            <p className="mt-2 text-slate-600">{t('messages.emptyDescription')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messagesQuery.data.content.map((message) => (
              <article
                key={message.id}
                className={`rounded-2xl border p-5 ${MESSAGE_STYLES[message.type]}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800">
                    {message.type === 'OFFICIAL_ANSWER'
                      ? t('messages.officialAnswer')
                      : message.authorId === userId
                        ? t('messages.you')
                        : t('messages.participant')}
                  </span>
                  <time className="text-sm text-slate-500" dateTime={message.createdAt}>
                    {dateFormatter.format(new Date(message.createdAt))}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-slate-800">{message.content}</p>
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

      {question.state === 'CLOSED' ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">{t('comment.closedTitle')}</h2>
          <p className="mt-1 text-amber-800">{t('comment.closedDescription')}</p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t('comment.title')}</h2>
          <form className="mt-4 flex flex-col gap-3" onSubmit={submitComment}>
            <textarea
              className="min-h-32 resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              maxLength={10_000}
              {...register('content', {
                required: t('validation.commentRequired'),
                maxLength: {
                  value: 10_000,
                  message: t('validation.contentMax'),
                },
                validate: (value) => value.trim().length > 0 || t('validation.commentRequired'),
              })}
            />
            {errors.content && (
              <span className="text-sm text-rose-700">{errors.content.message}</span>
            )}

            {commentMutation.isError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
                {commentErrorStatus === 409
                  ? t('errors.commentConflict')
                  : commentErrorStatus === 403
                    ? t('errors.commentForbidden')
                    : commentErrorStatus === 404
                      ? t('errors.questionNotFound')
                      : getForumErrorMessage(commentMutation.error, t('errors.commentFailed'))}
              </div>
            )}

            <button
              type="submit"
              className="self-start rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={commentMutation.isPending}
            >
              {commentMutation.isPending ? t('comment.submitting') : t('comment.submit')}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
