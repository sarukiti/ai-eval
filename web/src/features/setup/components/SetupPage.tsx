import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/container-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { NewOrganizationForm } from "@/src/features/organizations/components/NewOrganizationForm";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { NewProjectForm } from "@/src/features/projects/components/NewProjectForm";
import { useQueryProjectOrOrganization } from "@/src/features/projects/hooks";
import { ApiKeyRender } from "@/src/features/public-api/components/CreateApiKeyButton";
import { QuickstartExamples } from "@/src/features/public-api/components/QuickstartExamples";
import { MembershipInvitesPage } from "@/src/features/rbac/components/MembershipInvitesPage";
import { MembersTable } from "@/src/features/rbac/components/MembersTable";
import {
  createProjectRoute,
  inviteMembersRoute,
  setupTracingRoute,
} from "@/src/features/setup/setupRoutes";
import { api } from "@/src/utils/api";
import { cn } from "@/src/utils/tailwind";
import { type RouterOutput } from "@/src/utils/types";
import { Check } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";

// Multi-step setup process
// 1. Create Organization: /setup
// 2. Invite Members: /organization/:orgId/setup
// 3. Create Project: /organization/:orgId/setup?step=create-project
// 4. Setup Tracing: /project/:projectId/setup
export function SetupPage() {
  const { project, organization } = useQueryProjectOrOrganization();
  const router = useRouter();
  const [orgStep] = useQueryParam("orgstep", StringParam); // "invite-members" | "create-project"
  const queryProjectId = router.query.projectId as string | undefined;

  // starts at 1 to align with breadcrumb
  const stepInt = !organization
    ? 1
    : project
      ? 4
      : orgStep === "create-project"
        ? 3
        : 2;

  const hasTracingConfigured = api.traces.hasTracingConfigured.useQuery(
    { projectId: queryProjectId as string },
    {
      enabled: queryProjectId !== undefined && stepInt === 4,
      refetchInterval: 5000,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  ).data;

  const capture = usePostHogClientCapture();
  useEffect(() => {
    if (hasTracingConfigured !== undefined) {
      capture("onboarding:tracing_check_active", {
        active: hasTracingConfigured,
      });
    }
  }, [hasTracingConfigured, capture]);

  return (
    <ContainerPage
      headerProps={{
        title: "セットアップ",
        help: {
          description:
            "新しい組織を作成し、プロジェクトやチームをまとめて管理しましょう。",
        },
        ...(stepInt === 1 && {
          breadcrumb: [
            {
              name: "組織",
              href: "/",
            },
          ],
        }),
      }}
    >
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 1
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              1. 組織を作成
              {stepInt > 1 && <Check className="ml-1 inline-block h-3 w-3" />}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 2
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              2. メンバーを招待
              {stepInt > 2 && <Check className="ml-1 inline-block h-3 w-3" />}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 3
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              3. プロジェクトを作成
              {stepInt > 3 && <Check className="ml-1 inline-block h-3 w-3" />}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 4
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              4. トレースを設定
              {stepInt === 4 && <Check className="ml-1 inline-block h-3 w-3" />}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="p-3">
        {
          // 1. Create Org
          stepInt === 1 && (
            <div>
              <Header title="新しい組織" />
              <p className="mb-4 text-sm text-muted-foreground">
                組織を使うと、プロジェクトやチームをまとめて管理できます。
              </p>
              <NewOrganizationForm
                onSuccess={(orgId) => {
                  router.push(inviteMembersRoute(orgId));
                }}
              />
            </div>
          )
        }
        {
          // 2. Invite Members
          stepInt === 2 && organization && (
            <div className="flex flex-col gap-10">
              <div>
                <Header title="組織メンバー" />
                <p className="mb-4 text-sm text-muted-foreground">
                  協力したいメンバーを組織に招待しましょう。必要になったら、あとから追加することもできます。
                </p>
                <MembersTable orgId={organization.id} />
              </div>
              <div>
                <MembershipInvitesPage orgId={organization.id} />
              </div>
            </div>
          )
        }
        {
          // 3. Create Project
          stepInt === 3 && organization && (
            <div>
              <Header title="新しいプロジェクト" />
              <p className="mb-4 text-sm text-muted-foreground">
                プロジェクトではトレース・データセット・評価・プロンプトをまとめて管理します。複数環境がある場合は、同じプロジェクト内でタグを使って区別するのがおすすめです。
              </p>
              <NewProjectForm
                orgId={organization.id}
                onSuccess={(projectId) =>
                  router.push(setupTracingRoute(projectId))
                }
              />
            </div>
          )
        }
        {
          // 4. Setup Tracing
          stepInt === 4 && project && organization && (
            <TracingSetup
              projectId={project.id}
              hasTracingConfigured={hasTracingConfigured ?? false}
            />
          )
        }
      </Card>

      {stepInt === 2 && organization && (
        <Button
          className="mt-4 self-start"
          data-testid="btn-skip-add-members"
          onClick={() => router.push(createProjectRoute(organization.id))}
        >
          次へ進む
        </Button>
      )}
      {
        // 4. Setup Tracing
        stepInt === 4 && project && (
          <Button
            className="mt-4 self-start"
            onClick={() => router.push(`/project/${project.id}`)}
            variant={hasTracingConfigured ? "default" : "secondary"}
          >
            {hasTracingConfigured ? "ダッシュボードを開く" : "今回はスキップ"}
          </Button>
        )
      }
    </ContainerPage>
  );
}

const TracingSetup = ({
  projectId,
  hasTracingConfigured,
}: {
  projectId: string;
  hasTracingConfigured?: boolean;
}) => {
  const [apiKeys, setApiKeys] = useState<
    RouterOutput["projectApiKeys"]["create"] | null
  >(null);
  const utils = api.useUtils();
  const mutCreateApiKey = api.projectApiKeys.create.useMutation({
    onSuccess: (data) => {
      utils.projectApiKeys.invalidate();
      setApiKeys(data);
    },
  });

  const createApiKey = async () => {
    try {
      await mutCreateApiKey.mutateAsync({ projectId });
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Header title="API キー" />
        <p className="mb-4 text-sm text-muted-foreground">
          API
          リクエストの認証にはこれらのキーを使用します。追加のキーはプロジェクト設定からいつでも発行できます。
        </p>
        {apiKeys ? (
          <ApiKeyRender generatedKeys={apiKeys} scope={"project"} />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              アプリケーションのトレースを始めるには、API
              キーを作成する必要があります。
            </p>
            <Button
              onClick={createApiKey}
              loading={mutCreateApiKey.isPending}
              className="self-start"
            >
              API キーを作成
            </Button>
          </div>
        )}
      </div>

      <div>
        <Header
          title="トレース設定"
          status={hasTracingConfigured ? "active" : "pending"}
        />
        <p className="mb-4 text-sm text-muted-foreground">
          トレースは LLM
          呼び出しの追跡と分析に利用します。この手順はスキップして、あとから設定することも可能です。
        </p>
        <QuickstartExamples
          secretKey={apiKeys?.secretKey}
          publicKey={apiKeys?.publicKey}
        />
      </div>
    </div>
  );
};
