import { Octokit } from "@octokit/core";
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import { REPO_NAME, REPO_OWNER, ISS_LABEL } from "../config";

const octokit = new Octokit({
  auth: import.meta.env.TOKEN,
});

export const getSlugFromTitle = (full_title: string) => {
  const [title, slug] = full_title
    .replace(/(.+)\[(.+?)\]$/g, "$1\uE000$2")
    .split("\uE000")
    .map((e: string) => e.trim());

  return {
    title,
    slug,
  };
};

export const formatReaction = (
  reactionQueryArray: {
    content: string;
    users: {
      totalCount: number;
    };
  }[]
) =>
  Object.fromEntries(
    reactionQueryArray.map((reaction) => [reaction.content, reaction.users.totalCount])
  );

export const fetchIssuesSlugs = async () => {
  const response = await octokit.graphql<GraphQlQueryResponseData>(
    `{
  repository(name: "${REPO_NAME}", owner: "${REPO_OWNER}") {
    issues(first: 10, labels: "${ISS_LABEL}") {
      nodes {
        title
        number
      }
    }
  }
}`
  );

  return response.repository.issues.nodes.map((e: any) => {
    const { slug, title } = getSlugFromTitle(e.title);

    return {
      params: {
        slug,
      },
      props: {
        title,
        issueNumber: e.number,
      },
    };
  }) as {
    params: {
      slug: string;
    };
    props: {
      title: string;
      issueNumber: number;
    };
  }[];
};

export const fetchIssues = async () => {
  const response = await octokit.graphql<GraphQlQueryResponseData>(
    `{
  repository(name: "${REPO_NAME}", owner: "${REPO_OWNER}") {
    issues(first: 10, labels: "${ISS_LABEL}") {
      nodes {
        title
        number
        bodyText
        comments {
          totalCount
        }
        updatedAt
        createdAt
        reactionGroups {
          content
          users {
            totalCount
          }
        }
        reactions {
          totalCount
        }
      }
    }
  }
}`
  );

  return response.repository.issues.nodes.map((e: any) => {
    const { slug, title } = getSlugFromTitle(e.title);
    const formattedReaction = {
      ...formatReaction(e.reactionGroups),
      totalCount: e.reactions.totalCount,
    };

    return {
      slug,
      title,
      issueNumber: e.number,
      bodyText: e.bodyText,
      commentCount: +e.comments.totalCount,
      reactions: formattedReaction,
      updatedAt: e.updatedAt,
      createdAt: e.createdAt,
    };
  }) as {
    slug: string;
    title: string;
    issueNumber: number;
    bodyText: string;
    commentCount: number;
    updatedAt: string;
    createdAt: string;
    reactions: {
      THUMBS_UP: number;
      THUMBS_DOWN: number;
      LAUGH: number;
      HOORAY: number;
      CONFUSED: number;
      HEART: number;
      ROCKET: number;
      EYES: number;
      totalCount: number;
    };
  }[];
};

export const fetchIssue = async (number: number) => {
  const response = await octokit.graphql<GraphQlQueryResponseData>(
    `query Issue($number: Int!) {
  repository(name: "${REPO_NAME}", owner: "${REPO_OWNER}") {
    issue(number: $number) {
      author {
        avatarUrl
        login
        url
      }
      createdAt
      updatedAt
      url
      body
      comments(last: 10) {
        nodes {
          body
          author {
            avatarUrl
            login
            url
          }
          url
        }
      }
    }
  }
}`,
    {
      number,
    }
  );

  return response.repository.issue;
};
