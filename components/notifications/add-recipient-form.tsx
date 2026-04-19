"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addRecipientSchema,
  addPortalRecipientSchema,
  type AddRecipientValues,
  type AddPortalRecipientValues,
} from "@/lib/validations/notification-recipient.schema";
import {
  addRecipientAction,
  addPortalRecipientAction,
} from "@/app/(admin)/admin/notifications/actions";
import { FormError } from "@/components/shared/form-error";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PortalUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AddRecipientFormProps {
  availableUsers: PortalUser[];
}

function PortalUserForm({
  availableUsers,
  onDone,
}: {
  availableUsers: PortalUser[];
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<AddPortalRecipientValues>({
    resolver: zodResolver(addPortalRecipientSchema),
    defaultValues: { userId: "" },
  });

  function onSubmit(values: AddPortalRecipientValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await addPortalRecipientAction(values);
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong.",
        );
        return;
      }
      toast.success("Recipient added successfully");
      form.reset();
      onDone();
    });
  }

  if (availableUsers.length === 0) {
    return (
      <p className="text-base text-muted-foreground py-4">
        All active portal users are already added as recipients.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={error} />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Select user <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Choose a portal user…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="text-base"
                    >
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-muted-foreground ml-2">
                        {user.email}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full text-base">
          {isPending ? "Adding…" : "Add recipient"}
        </Button>
      </form>
    </Form>
  );
}

function ExternalForm({ onDone }: { onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<AddRecipientValues>({
    resolver: zodResolver(addRecipientSchema),
    defaultValues: { email: "", name: "", role: "" },
  });

  function onSubmit(values: AddRecipientValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await addRecipientAction(values);
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Please check the fields below.",
        );
        return;
      }
      toast.success("Recipient added successfully");
      form.reset();
      onDone();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={error} />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="officer@example.gov.za"
                  className="text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. John Smith"
                  className="text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Role label
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. Senior Permit Officer"
                  className="text-base"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Informational only — not a system role
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full text-base">
          {isPending ? "Adding…" : "Add recipient"}
        </Button>
      </form>
    </Form>
  );
}

export default function AddRecipientForm({
  availableUsers,
}: AddRecipientFormProps) {
  const router = useRouter();

  function handleDone() {
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Recipient</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Add a portal user or an external email address to receive new permit
          submission alerts.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="portal">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="portal" className="flex-1 text-base">
              Portal user
            </TabsTrigger>
            <TabsTrigger value="external" className="flex-1 text-base">
              External email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portal">
            <PortalUserForm
              availableUsers={availableUsers}
              onDone={handleDone}
            />
          </TabsContent>

          <TabsContent value="external">
            <ExternalForm onDone={handleDone} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
