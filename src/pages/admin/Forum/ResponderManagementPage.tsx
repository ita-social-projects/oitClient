import type {
  PageResponse,
  TaskAssignmentForumResponderResponseDTO,
} from '@shared/models/forum';
import type { UserDto } from '@shared/models/user';
import { forumKeys } from '@shared/query/forumKeys';
import { forumService } from '@shared/services/forumService';
import { userService } from '@shared/services/userService';
import {
  getForumErrorMessage,
  getForumErrorStatus,
  parsePositiveRouteId,
  retryForumQuery,
} from '@shared/utils/forumError';
import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { ForumPagination } from '../../user/Forum/ForumPagination';

const RESPONDER_PAGE_SIZE = 20;
const CANDIDATE_PAGE_SIZE = 20;
const MIN_SEARCH_LENGTH = 2;

interface GrantResult {
  responder: TaskAssignmentForumResponderResponseDTO;
  created: boolean;
}

const recalculatePage = <T,>(page: PageResponse<T>, totalElements: number) => {
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / page.pageSize);

  return {
    totalElements,
    totalPages,
    first: page.pageNumber === 0,
    last: totalPages === 0 || page.pageNumber >= totalPages - 1,
  };
};

const applyGrantedResponder = (
  queryClient: QueryClient,
  taskAssignmentId: number,
  result: GrantResult,
) => {
  const queryFilter = {
    queryKey: forumKeys.responderLists(taskAssignmentId),
  };
  const cachedPages = queryClient.getQueriesData<
    PageResponse<TaskAssignmentForumResponderResponseDTO>
  >(queryFilter);
  const alreadyCached = cachedPages.some(([, page]) =>
    page?.content.some(
      (item) => item.responderUserId === result.responder.responderUserId,
    ),
  );

  queryClient.setQueriesData<
    PageResponse<TaskAssignmentForumResponderResponseDTO>
  >(queryFilter, (page) => {
    if (!page) {
      return page;
    }

    const existingIndex = page.content.findIndex(
      (item) => item.responderUserId === result.responder.responderUserId,
    );

    if (existingIndex >= 0) {
      const content = page.content.slice();
      content[existingIndex] = result.responder;

      return { ...page, content };
    }

    if (!result.created || alreadyCached) {
      return page;
    }

    const totalElements = page.totalElements + 1;
    const pageMetadata = recalculatePage(page, totalElements);

    if (page.pageNumber !== 0) {
      return { ...page, ...pageMetadata };
    }

    return {
      ...page,
      ...pageMetadata,
      content: [result.responder, ...page.content].slice(0, page.pageSize),
    };
  });
};

const applyRevokedResponder = (
  queryClient: QueryClient,
  taskAssignmentId: number,
  responderUserId: number,
) => {
  const queryFilter = {
    queryKey: forumKeys.responderLists(taskAssignmentId),
  };
  const cachedPages = queryClient.getQueriesData<
    PageResponse<TaskAssignmentForumResponderResponseDTO>
  >(queryFilter);
  const existed = cachedPages.some(([, page]) =>
    page?.content.some((item) => item.responderUserId === responderUserId),
  );

  queryClient.setQueriesData<
    PageResponse<TaskAssignmentForumResponderResponseDTO>
  >(queryFilter, (page) => {
    if (!page) {
      return page;
    }

    const content = page.content.filter(
      (item) => item.responderUserId !== responderUserId,
    );

    if (!existed) {
      return page;
    }

    const totalElements = Math.max(0, page.totalElements - 1);
    const pageMetadata = recalculatePage(page, totalElements);

    if (content.length === page.content.length) {
      return { ...page, ...pageMetadata };
    }

    return {
      ...page,
      ...pageMetadata,
      content,
    };
  });
};

const candidateDisplayName = (candidate: UserDto) => {
  const name = [candidate.firstName, candidate.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || candidate.email;
};

export default function ResponderManagementPage() {
  const { t, i18n } = useTranslation('forum');
  const queryClient = useQueryClient();
  const { taskAssignmentId: routeTaskAssignmentId } = useParams();
  const taskAssignmentId = parsePositiveRouteId(routeTaskAssignmentId);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidatePage, setCandidatePage] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const respondersQuery = useQuery({
    queryKey: forumKeys.responders(
      taskAssignmentId ?? 0,
      page,
      RESPONDER_PAGE_SIZE,
    ),
    queryFn: () =>
      forumService.getForumResponders(taskAssignmentId!, {
        page,
        size: RESPONDER_PAGE_SIZE,
      }),
    enabled: taskAssignmentId !== null,
    staleTime: Infinity,
    refetchOnReconnect: false,
    retry: retryForumQuery,
    placeholderData: keepPreviousData,
  });

  const candidatesQuery = useQuery({
    queryKey: [
      'users',
      'forum-responder-candidates',
      searchTerm,
      candidatePage,
      CANDIDATE_PAGE_SIZE,
    ] as const,
    queryFn: () =>
      userService.getUsers(candidatePage, CANDIDATE_PAGE_SIZE, searchTerm),
    enabled: searchTerm.length >= MIN_SEARCH_LENGTH,
    staleTime: 30_000,
    retry: retryForumQuery,
  });

  const grantMutation = useMutation({
    mutationFn: (userId: number) =>
      forumService.grantForumResponder(taskAssignmentId!, userId),
    onMutate: () => {
      setSuccessMessage(null);
    },
    onSuccess: (result) => {
      applyGrantedResponder(queryClient, taskAssignmentId!, result);
      setSuccessMessage(
        result.created
          ? t('responders.feedback.granted')
          : t('responders.feedback.alreadyAssigned'),
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (userId: number) => {
      await forumService.revokeForumResponder(taskAssignmentId!, userId);
      return userId;
    },
    onMutate: () => {
      setSuccessMessage(null);
    },
    onSuccess: (userId) => {
      applyRevokedResponder(queryClient, taskAssignmentId!, userId);

      if (page > 0 && respondersQuery.data?.content.length === 1) {
        setPage(page - 1);
      }

      setSuccessMessage(t('responders.feedback.revoked'));
    },
  });

  const activeResponderIds = useMemo(
    () =>
      new Set(
        respondersQuery.data?.content.map((item) => item.responderUserId) ?? [],
      ),
    [respondersQuery.data],
  );

  const candidates = useMemo(
    () =>
      (candidatesQuery.data?.content ?? []).filter(
        (candidate) =>
          candidate.role === 'ORG' && candidate.status === 'ACTIVE',
      ),
    [candidatesQuery.data],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language],
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    grantMutation.reset();
    setSuccessMessage(null);
    setCandidatePage(0);
    setSearchTerm(searchInput.trim());
  };

  if (taskAssignmentId === null) {
    return (
      <main className="mx-auto max-w-4xl p-6 md:p-10">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h1 className="text-xl font-semibold">
            {t('responders.errors.invalidTaskAssignment')}
          </h1>
          <Link
            className="mt-4 inline-block font-semibold underline"
            to="/profile/forum/reviews"
          >
            {t('responders.backToReviews')}
          </Link>
        </section>
      </main>
    );
  }

  const grantError = grantMutation.error;
  const revokeError = revokeMutation.error;
  const revokeErrorStatus = getForumErrorStatus(revokeError);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header>
        <Link
          className="text-sm font-semibold text-blue-700 hover:underline"
          to="/profile/forum/reviews"
        >
          {t('responders.backToReviews')}
        </Link>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-700">
          {t('responders.taskAssignment', { id: taskAssignmentId })}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('responders.title')}
        </h1>
        <p className="mt-2 text-slate-600">{t('responders.description')}</p>
      </header>

      {successMessage && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          {successMessage}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t('responders.list.title')}
            </h2>
            {respondersQuery.data && (
              <p className="mt-1 text-sm text-slate-600">
                {t('responders.list.total', {
                  count: respondersQuery.data.totalElements,
                })}
              </p>
            )}
          </div>

          {respondersQuery.isPending ? (
            <div className="py-8 text-center text-slate-600">
              {t('responders.list.loading')}
            </div>
          ) : respondersQuery.isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              <p>
                {getForumErrorMessage(
                  respondersQuery.error,
                  t('responders.errors.loadFailed'),
                )}
              </p>
              <button
                type="button"
                className="mt-3 font-semibold underline"
                onClick={() => void respondersQuery.refetch()}
              >
                {t('actions.retry')}
              </button>
            </div>
          ) : !respondersQuery.data || respondersQuery.data.content.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
              {t('responders.list.empty')}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {respondersQuery.data.content.map((responder) => {
                const isRevoking =
                  revokeMutation.isPending &&
                  revokeMutation.variables === responder.responderUserId;
                const hasRowConflict =
                  revokeMutation.isError &&
                  revokeMutation.variables === responder.responderUserId &&
                  revokeErrorStatus === 409;

                return (
                  <article
                    key={responder.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {[responder.responderFirstName, responder.responderLastName]
                            .filter(Boolean)
                            .join(' ') || responder.responderEmail}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {responder.responderEmail}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {t('responders.list.assignedAt', {
                            date: dateFormatter.format(
                              new Date(responder.assignedAt),
                            ),
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={revokeMutation.isPending}
                        onClick={() => {
                          revokeMutation.reset();
                          grantMutation.reset();
                          setSuccessMessage(null);
                          revokeMutation.mutate(responder.responderUserId);
                        }}
                      >
                        {isRevoking
                          ? t('responders.actions.revoking')
                          : t('responders.actions.revoke')}
                      </button>
                    </div>
                    {hasRowConflict && (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                        {t('responders.errors.activeReview')}
                      </p>
                    )}
                    {revokeMutation.isError &&
                      revokeMutation.variables === responder.responderUserId &&
                      revokeErrorStatus !== 409 && (
                        <p className="mt-3 text-sm text-rose-700">
                          {getForumErrorMessage(
                            revokeError,
                            t('responders.errors.revokeFailed'),
                          )}
                        </p>
                      )}
                  </article>
                );
              })}
            </div>
          )}

          {respondersQuery.data && (
            <ForumPagination
              pageNumber={respondersQuery.data.pageNumber}
              totalPages={respondersQuery.data.totalPages}
              first={respondersQuery.data.first}
              last={respondersQuery.data.last}
              disabled={respondersQuery.isFetching || revokeMutation.isPending}
              onPageChange={(nextPage) => {
                revokeMutation.reset();
                setPage(nextPage);
              }}
            />
          )}
        </section>

        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t('responders.search.title')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t('responders.search.description')}
            </p>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
            <input
              type="search"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={t('responders.search.placeholder')}
              value={searchInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchInput(event.target.value)
              }
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={searchInput.trim().length < MIN_SEARCH_LENGTH}
            >
              {t('responders.actions.search')}
            </button>
          </form>

          {searchTerm.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t('responders.search.hint', { count: MIN_SEARCH_LENGTH })}
            </p>
          ) : candidatesQuery.isPending ? (
            <div className="py-6 text-center text-slate-600">
              {t('responders.search.loading')}
            </div>
          ) : candidatesQuery.isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              {getForumErrorMessage(
                candidatesQuery.error,
                t('responders.errors.searchFailed'),
              )}
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
              {t('responders.search.empty')}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidates.map((candidate) => {
                const isAssigned = activeResponderIds.has(candidate.id);
                const isGranting =
                  grantMutation.isPending && grantMutation.variables === candidate.id;

                return (
                  <article
                    key={candidate.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {candidateDisplayName(candidate)}
                      </h3>
                      <p className="text-sm text-slate-600">{candidate.email}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      disabled={isAssigned || grantMutation.isPending}
                      onClick={() => {
                        grantMutation.reset();
                        revokeMutation.reset();
                        setSuccessMessage(null);
                        grantMutation.mutate(candidate.id);
                      }}
                    >
                      {isAssigned
                        ? t('responders.actions.assigned')
                        : isGranting
                          ? t('responders.actions.granting')
                          : t('responders.actions.grant')}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {candidatesQuery.data && searchTerm.length >= MIN_SEARCH_LENGTH && (
            <ForumPagination
              pageNumber={candidatesQuery.data.pageNumber}
              totalPages={candidatesQuery.data.totalPages}
              first={candidatesQuery.data.first}
              last={candidatesQuery.data.last}
              disabled={candidatesQuery.isFetching || grantMutation.isPending}
              onPageChange={setCandidatePage}
            />
          )}

          {grantError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              {getForumErrorMessage(
                grantError,
                t('responders.errors.grantFailed'),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
