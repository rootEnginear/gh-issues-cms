import { Octokit } from "@octokit/core";
import type { GraphQlQueryResponseData } from "@octokit/graphql";

const octokit = new Octokit({
  auth: import.meta.env.TOKEN,
});

export const splitSlugFromTitle = (full_title: string) => {
  const [title, slug] = full_title
    .replace(/(.+)\[(.+?)\]$/g, "$1\uE000$2")
    .split("\uE000")
    .map((e: string) => e.trim());

  return {
    title,
    slug,
  };
};

export const fetchIssues = async () => {
  const response = await octokit.graphql<GraphQlQueryResponseData>(
    `{
  repository(name: "gh-issues-cms", owner: "rootEnginear") {
    issues(first: 10, labels: "state:published") {
      nodes {
        title
        number
      }
    }
  }
}`
  );

  return response.repository.issues.nodes.map((e: any) => {
    const { slug, title } = splitSlugFromTitle(e.title);

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

export const fetchIssue = async (number: number) => {
  const response = await octokit.graphql<GraphQlQueryResponseData>(
    `query Issue($number: Int!) {
  repository(name: "gh-issues-cms", owner: "rootEnginear") {
    issue(number: $number) {
      body
      author {
        avatarUrl
        login
        url
      }
      lastEditedAt
      createdAt
      labels(first: 100) {
        nodes {
          name
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
