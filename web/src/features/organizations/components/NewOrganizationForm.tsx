import { Button } from "@/src/components/ui/button";
import { useEffect } from "react";
import type * as z from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { api } from "@/src/utils/api";
import { useSession } from "next-auth/react";
import { organizationFormSchema } from "@/src/features/organizations/utils/organizationNameSchema";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { SurveyName } from "@prisma/client";
import { env } from "@/src/env.mjs";

export const NewOrganizationForm = ({
  onSuccess,
}: {
  onSuccess: (orgId: string) => void;
}) => {
  const { update: updateSession } = useSession();

  const form = useForm({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      type: "Personal",
      size: undefined,
    },
  });
  const capture = usePostHogClientCapture();
  const createOrgMutation = api.organizations.create.useMutation({
    onError: (error) => form.setError("name", { message: error.message }),
  });
  const createSurveyMutation = api.surveys.create.useMutation();
  const watchedType = form.watch("type");
  const isCloud = Boolean(env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION);

  function onSubmit(values: z.infer<typeof organizationFormSchema>) {
    capture("organizations:new_form_submit");
    createOrgMutation
      .mutateAsync({
        name: values.name,
      })
      .then(async (org) => {
        // Submit survey with organization data only on Cloud and if type is provided
        if (isCloud && values.type) {
          const surveyResponse: Record<string, string> = {
            type: values.type,
          };
          if (values.size) {
            surveyResponse.size = values.size;
          }

          try {
            await createSurveyMutation.mutateAsync({
              surveyName: SurveyName.ORG_ONBOARDING,
              response: surveyResponse,
              orgId: org.id,
            });
          } catch (error) {
            console.error("Failed to submit survey:", error);
            // Continue with organization creation even if survey fails
          }
        }

        void updateSession();
        onSuccess(org.id);
        form.reset();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Clear size whenever type is not Company or Agency to avoid submitting hidden values
  useEffect(() => {
    if (watchedType !== "Company" && watchedType !== "Agency") {
      form.setValue("size", undefined);
    }
  }, [watchedType, form]);

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        data-testid="new-org-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>組織名</FormLabel>
              <FormControl>
                <Input
                  placeholder="my-org"
                  {...field}
                  data-testid="new-org-name-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isCloud && (
          <>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>組織のタイプ</FormLabel>
                  <FormDescription>
                    組織の特徴に最も近いものを選択してください。
                  </FormDescription>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Personal">個人</SelectItem>
                      <SelectItem value="Educational">教育機関</SelectItem>
                      <SelectItem value="Company">企業</SelectItem>
                      <SelectItem value="Startup">スタートアップ</SelectItem>
                      <SelectItem value="Agency">代理店</SelectItem>
                      <SelectItem value="N/A">該当なし</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(watchedType === "Company" || watchedType === "Agency") && (
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchedType === "Company"
                        ? "企業の規模"
                        : "代理店の規模"}
                    </FormLabel>
                    <FormDescription>
                      {watchedType === "Company"
                        ? "企業の従業員数を選択してください。"
                        : "代理店の規模を選択してください。"}
                    </FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 人</SelectItem>
                        <SelectItem value="10-49">10-49 人</SelectItem>
                        <SelectItem value="50-99">50-99 人</SelectItem>
                        <SelectItem value="100-299">100-299 人</SelectItem>
                        <SelectItem value="More than 300">
                          300 人以上
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        <Button type="submit" loading={createOrgMutation.isPending}>
          作成する
        </Button>
      </form>
    </Form>
  );
};
