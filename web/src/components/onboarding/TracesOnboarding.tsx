import React from "react";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { setupTracingRoute } from "@/src/features/setup/setupRoutes";
import { BarChart4, GitMerge, Search, Zap } from "lucide-react";

interface TracesOnboardingProps {
  projectId: string;
}

export function TracesOnboarding({ projectId }: TracesOnboardingProps) {
  const valuePropositions: ValueProposition[] = [
    {
      title: "完全なコンテキストの取得",
      description:
        "API 呼び出しやコンテキスト、プロンプト、並列処理などを含む実行フロー全体を追跡できます",
      icon: <GitMerge className="h-4 w-4" />,
    },
    {
      title: "コストの可視化",
      description:
        "アプリケーション全体のモデル利用状況とコストを可視化できます",
      icon: <BarChart4 className="h-4 w-4" />,
    },
    {
      title: "評価の基盤",
      description:
        "評価スコアを追加して問題の特定やメトリクスの推移を追跡できます",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "オープンかつマルチモーダル",
      description:
        "Langfuse のトレースには画像・音声などのモーダリティも含められ、用途に合わせて自由にカスタマイズできます",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <SplashScreen
      title="LLM トレースを始めましょう"
      description="トレースを使うと、アプリ／エージェント内のすべての LLM 呼び出しや関連ロジックを追跡できます。Langfuse のネストされたトレースは処理の状況を理解し、問題の原因を特定するのに役立ちます。"
      valuePropositions={valuePropositions}
      primaryAction={{
        label: "トレースを設定",
        href: setupTracingRoute(projectId),
      }}
      secondaryAction={{
        label: "ドキュメントを見る",
        href: "https://langfuse.com/docs/observability/overview",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/tracing-overview-v1.mp4"
    />
  );
}
