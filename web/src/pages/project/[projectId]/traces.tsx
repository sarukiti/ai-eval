import React from "react";
import { useRouter } from "next/router";
import TracesTable from "@/src/components/table/use-cases/traces";
import Page from "@/src/components/layouts/page";
import { api } from "@/src/utils/api";
import { TracesOnboarding } from "@/src/components/onboarding/TracesOnboarding";
import {
  getTracingTabs,
  TRACING_TABS,
} from "@/src/features/navigation/utils/tracing-tabs";

export default function Traces() {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  // Check if the user has tracing configured
  const { data: hasTracingConfigured, isLoading } =
    api.traces.hasTracingConfigured.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        trpc: {
          context: {
            skipBatch: true,
          },
        },
        refetchInterval: 10_000,
      },
    );

  const showOnboarding = !isLoading && !hasTracingConfigured;

  return (
    <Page
      headerProps={{
        title: "トレース",
        help: {
          description:
            "トレースは単一の関数／API 呼び出しを表し、関連する観測データを含みます。詳しくはドキュメントをご覧ください。",
          href: "https://langfuse.com/docs/observability/data-model",
        },
        tabsProps: {
          tabs: getTracingTabs(projectId),
          activeTab: TRACING_TABS.TRACES,
        },
      }}
      scrollable={showOnboarding}
    >
      {/* Show onboarding screen if user has no traces */}
      {showOnboarding ? (
        <TracesOnboarding projectId={projectId} />
      ) : (
        <TracesTable projectId={projectId} />
      )}
    </Page>
  );
}
