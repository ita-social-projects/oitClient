import type {
  CreateQuestionRequest,
  QuestionState,
  QuestionStatus,
  QuestionVisibility,
} from '@shared/models/forum';
import { forumKeys } from '@shared/query/forumKeys';
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
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ForumPagination } from './ForumPagination';

const PAGE_SIZE = 20;

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

const badgeClassName = (style: string) =>
  `rounded-full px-2.5 py-1 text-xs font-semibold ${style}`;

export default function ParticipantForumPage() {
  const { t, i18n } = useTranslation('forum');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { taskAssignmentId: taskAssignmentIdParam } = useParams();
  const taskAssignmentId = parsePositiveRouteId(taskAssignmentIdParam);
  const userId = useAuth((state: AuthState) => state.user?.id);
  const [page, setPage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateQuestionRequest>({
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const questionsQuery = useQuery({
    queryKey: forumKeys.participantList(
      userId ?? 0,
      taskAssignmentId ?? 0,
      page,
      PAGE_SIZE,
    ),
    queryFn: () =>
      forumService.getParticipantQuestions(taskAssignmentId!, {
        page,
        size: PAGE_SIZE,
      }),
    enabled: userId !== undefined && taskAssignmentId !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (
      questionsQuery.data &&
      questionsQuery.data.totalPages > 0 &&
      page >= questionsQuery.data.totalPages
    ) {
      setPage(questionsQuery.data.totalPages - 1);
    }
  }, [page, questionsQuery.data]);

  const createQuestionMutation = useMutation({
    mutationFn: (request: CreateQuestionRequest) =>
      forumService.createQuestion(taskAssignmentId!, request),
    onSuccess: (question) => {
      queryClient.setQueryData(forumKeys.question(userId!, question.id), question);
      void queryClient.invalidateQueries({
        queryKey: forumKeys.participantLists(userId!, question.taskAssignmentId),
      });
      reset();
      navigate(`/forum/questions/${question.id}`);
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

  const submitQuestion = handleSubmit((values) => {
    createQuestionMutation.reset();
    createQuestionMutation.mutate({
      title: values.title.trim(),
      content: values.content.trim(),
    });
  });

  if (taskAssignmentId === null) {
    return (
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-semibold text-rose-900">{t('errors.notFoundTitle')}</h1>
          <p className="mt-2 text-rose-800">{t('errors.invalidTaskAssignment')}</p>
          <Link className="mt-4 inline-block font-semibold text-rose-900 underline" to="/competitions">
            {t('actions.backToCompetitions')}
          </Link>
        </section>
      </main>
    );
  }

  if (questionsQuery.isPending) {
    return (
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {t('forum.loading')}
        </div>
      </main>
    );
  }

  if (questionsQuery.isError) {
    const status = getForumErrorStatus(questionsQuery.error);
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
              ? t('errors.forbiddenForum')
              : isNotFound
                ? t('errors.taskAssignmentNotFound')
                : getForumErrorMessage(questionsQuery.error, t('errors.loadFailed'))}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!isForbidden && !isNotFound && (
              <button
                type="button"
                className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800"
                onClick={() => void questionsQuery.refetch()}
              >
                {t('actions.retry')}
              </button>
            )}
            <Link className="rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-900" to="/competitions">
              {t('actions.backToCompetitions')}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const createErrorStatus = getForumErrorStatus(createQuestionMutation.error);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          {t('forum.taskAssignment', { id: taskAssignmentId })}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{t('forum.title')}</h1>
        <p className="mt-2 text-slate-600">{t('forum.description')}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{t('create.title')}</h2>
        <form className="mt-5 flex flex-col gap-4" onSubmit={submitQuestion}>
          <label className="flex flex-col gap-2 font-medium text-slate-800">
            {t('create.titleLabel')}
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              maxLength={200}
              {...register('title', {
                required: t('validation.titleRequired'),
                maxLength: {
                  value: 200,
                  message: t('validation.titleMax'),
                },
                validate: (value) => value.trim().length > 0 || t('validation.titleRequired'),
              })}
            />
            {errors.title && <span className="text-sm text-rose-700">{errors.title.message}</span>}
          </label>

          <label className="flex flex-col gap-2 font-medium text-slate-800">
            {t('create.contentLabel')}
            <textarea
              className="min-h-36 resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              maxLength={10_000}
              {...register('content', {
                required: t('validation.contentRequired'),
                maxLength: {
                  value: 10_000,
                  message: t('validation.contentMax'),
                },
                validate: (value) => value.trim().length > 0 || t('validation.contentRequired'),
              })}
            />
            {errors.content && (
              <span className="text-sm text-rose-700">{errors.content.message}</span>
            )}
          </label>

          {createQuestionMutation.isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
              {createErrorStatus === 403
                ? t('errors.createForbidden')
                : createErrorStatus === 404
                  ? t('errors.taskAssignmentNotFound')
                  : createErrorStatus === 409
                    ? t('errors.createConflict')
                    : getForumErrorMessage(createQuestionMutation.error, t('errors.createFailed'))}
            </div>
          )}

          <button
            type="submit"
            className="self-start rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createQuestionMutation.isPending}
          >
            {createQuestionMutation.isPending ? t('create.submitting') : t('create.submit')}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t('list.title')}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {t('list.total', { count: questionsQuery.data.totalElements })}
            </p>
          </div>
          {questionsQuery.isFetching && (
            <span className="text-sm text-slate-500">{t('list.refreshing')}</span>
          )}
        </div>

        {questionsQuery.data.content.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-800">{t('list.emptyTitle')}</h3>
            <p className="mt-2 text-slate-600">{t('list.emptyDescription')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {questionsQuery.data.content.map((question) => (
              <Link
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                to={`/forum/questions/${question.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{question.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {t('list.createdAt', {
                        date: dateFormatter.format(new Date(question.createdAt)),
                      })}
                    </p>
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
              </Link>
            ))}
          </div>
        )}

        <ForumPagination
          pageNumber={questionsQuery.data.pageNumber}
          totalPages={questionsQuery.data.totalPages}
          first={questionsQuery.data.first}
          last={questionsQuery.data.last}
          disabled={questionsQuery.isFetching}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
