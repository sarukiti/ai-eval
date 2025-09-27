import { CodeView } from "@/src/components/ui/CodeJsonViewer";
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";
import { env } from "@/src/env.mjs";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import Link from "next/link";

export const QuickstartExamples = (p: {
  secretKey?: string;
  publicKey?: string;
}) => {
  const uiCustomization = useUiCustomization();
  const capture = usePostHogClientCapture();
  const tabs = [
    { value: "python", label: "Python" },
    { value: "js", label: "JS/TS" },
    { value: "openai", label: "OpenAI" },
    { value: "langchain", label: "Langchain" },
    { value: "langchain-js", label: "Langchain JS" },
    { value: "other", label: "Other" },
  ];
  const host = `${uiCustomization?.hostname ?? window.origin}${env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

  const secretKey = p.secretKey ?? "<secret key>";
  const publicKey = p.publicKey ?? "<public key>";

  // if custom docs link, do not show quickstart examples but refer to docs
  if (uiCustomization?.documentationHref) {
    return (
      <p className="mb-2">
        Langfuse の設定手順は、社内ドキュメントを参照してください:{" "}
        <Link
          href={uiCustomization.documentationHref}
          target="_blank"
          className="underline"
        >
          社内ドキュメント
        </Link>
        。
      </p>
    );
  }

  return (
    <div>
      <Tabs defaultValue="python" className="relative max-w-full">
        <div className="overflow-x-scroll">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() =>
                  capture("onboarding:code_example_tab_switch", {
                    tabLabel: tab.value,
                  })
                }
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="python">
          <CodeView content="pip install langfuse" className="mb-2" />
          <CodeView
            content={`from langfuse import Langfuse\n\nlangfuse = Langfuse(\n  secret_key="${secretKey}",\n  public_key="${publicKey}",\n  host="${host}"\n)`}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            詳細な手順やサンプルは{" "}
            <a
              href="https://langfuse.com/docs/observability/get-started"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              クイックスタート
            </a>{" "}
            と{" "}
            <a
              href="https://langfuse.com/docs/sdk/python"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Python ドキュメント
            </a>
            を参照してください。
          </p>
        </TabsContent>
        <TabsContent value="js">
          <CodeView content="npm install @langfuse/client" className="mb-2" />
          <CodeView
            content={`import { LangfuseClient } from "@langfuse/client";\n\nconst langfuse = new LangfuseClient({\n  secretKey: "${secretKey}",\n  publicKey: "${publicKey}",\n  baseUrl: "${host}"\n});`}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            詳細は{" "}
            <a
              href="https://langfuse.com/docs/observability/get-started"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              クイックスタート
            </a>{" "}
            と{" "}
            <a
              href="https://langfuse.com/docs/sdk/typescript"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              JS/TS ドキュメント
            </a>
            をご覧ください。
          </p>
        </TabsContent>
        <TabsContent value="openai">
          <p className="mt-2 text-xs text-muted-foreground">
            この統合は OpenAI Python SDK
            の置き換えとして利用でき、インポートを切り替えるだけで Langfuse が
            LLM 呼び出しを非同期で収集します。
          </p>
          <CodeView content="pip install langfuse" className="my-2" />
          <CodeView
            title=".env"
            content={`LANGFUSE_SECRET_KEY=${secretKey}\nLANGFUSE_PUBLIC_KEY=${publicKey}\nLANGFUSE_HOST="${host}"`}
            className="my-2"
          />
          <CodeView
            content={`# remove: import openai\n\nfrom langfuse.openai import openai`}
            className="my-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            OpenAI SDK はこれまでどおり使用できます。詳細は{" "}
            <a
              href="https://langfuse.com/integrations/model-providers/openai-py"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenAI 連携ドキュメント
            </a>
            を参照してください。
          </p>
        </TabsContent>
        <TabsContent value="langchain">
          <p className="mt-2 text-xs text-muted-foreground">
            Langchain
            のコールバック機構を利用し、実行内容を自動的に詳細トレースとして記録します。
          </p>
          <CodeView content="pip install langfuse" className="my-2" />
          <CodeView
            content={LANGCHAIN_PYTHON_CODE({ publicKey, secretKey, host })}
            className="my-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            詳しくは{" "}
            <a
              href="https://langfuse.com/integrations/frameworks/langchain"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Langchain 連携ドキュメント
            </a>
            を参照してください。
          </p>
        </TabsContent>
        <TabsContent value="langchain-js">
          <p className="mt-2 text-xs text-muted-foreground">
            Langchain のコールバック機構を利用して、Langchain
            の処理を自動記録します。
          </p>
          <CodeView
            content="npm install @langfuse/langchain"
            className="my-2"
          />
          <CodeView content={LANGCHAIN_JS_CODE()} className="my-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            詳細は{" "}
            <a
              href="https://langfuse.com/integrations/frameworks/langchain"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Langchain 連携ドキュメント
            </a>
            をご覧ください。
          </p>
        </TabsContent>
        <TabsContent value="other">
          <p className="mt-2 text-xs text-muted-foreground">
            Langfuse との連携は{" "}
            <a
              href="https://api.reference.langfuse.com/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              API リファレンス
            </a>
            や{" "}
            <a
              href="https://langfuse.com/docs/integrations"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              各種ネイティブ連携
            </a>
            （例: LiteLLM、Flowise、Langflow）を利用することもできます。
          </p>
        </TabsContent>
      </Tabs>
      <span className="mt-4 text-xs text-muted-foreground">
        ご不明点や問題がある場合は、まずは{" "}
        <a
          href="https://langfuse.com/faq/all/missing-traces"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          FAQ
        </a>
        をご確認いただき、解決しない場合は{" "}
        <Link
          className="underline"
          href="https://langfuse.com/docs/ask-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          AI に質問
        </Link>
        や{" "}
        <Link
          className="underline"
          href="https://langfuse.com/support"
          target="_blank"
          rel="noopener noreferrer"
        >
          サポートへのお問い合わせ
        </Link>
        をご利用ください。
      </span>
    </div>
  );
};
const LANGCHAIN_PYTHON_CODE = (p: {
  publicKey: string;
  secretKey: string;
  host: string;
}) => `from langfuse import Langfuse
from langfuse.langchain import CallbackHandler

langfuse = Langfuse(
    public_key="${p.publicKey}",
    secret_key="${p.secretKey}",
    host="${p.host}"
)

langfuse_handler = CallbackHandler()

# <Your Langchain code here>
 
# Add handler to run/invoke/call/chat
chain.invoke({"input": "<user_input>"}, config={"callbacks": [langfuse_handler]})`;

const LANGCHAIN_JS_CODE =
  () => `import { CallbackHandler } from "@langfuse/langchain";

// Make sure you have OpenTelemetry set up
// https://langfuse.com/docs/observability/sdk/typescript/setup#initialize-opentelemetry
 
// Initialize Langfuse callback handler
const langfuseHandler = new CallbackHandler();
 
// Your Langchain implementation
const chain = new LLMChain(...);
 
// Add handler as callback when running the Langchain agent
await chain.invoke(
  { input: "<user_input>" },
  { callbacks: [langfuseHandler] }
);`;
