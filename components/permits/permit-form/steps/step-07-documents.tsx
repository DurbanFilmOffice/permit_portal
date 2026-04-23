// "use client";

// import { useRef } from "react";
// import type { UseFormReturn } from "react-hook-form";
// import { X, Paperclip } from "lucide-react";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import type {
//   // GENRE_OPTIONS,
//   PermitFormValues,
// } from "@/lib/validations/permit-form.schema";

// interface Props {
//   form: UseFormReturn<PermitFormValues>;
//   files: File[];
//   onFilesChange: (files: File[]) => void;
// }

// function formatBytes(bytes: number): string {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// export function Step07Documents({ form, files, onFilesChange }: Props) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const values = form.getValues();

//   const genreLabel =
//     GENRE_OPTIONS.find((o) => o.value === values.formData.genre)?.label ??
//     values.formData.genre;

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selected = Array.from(e.target.files ?? []);
//     onFilesChange([...files, ...selected]);
//     if (inputRef.current) inputRef.current.value = "";
//   };

//   const removeFile = (index: number) => {
//     onFilesChange(files.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="space-y-8">
//       {/* ── Application summary ───────────────────────────────────────── */}
//       <div className="rounded-md border border-input bg-muted/40 p-4 space-y-3">
//         <p className="text-base font-medium">Review your application</p>
//         <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-1.5 text-base">
//           <span className="text-muted-foreground">Project</span>
//           <span className="font-medium">
//             {values.formData.projectTitle || "—"}
//           </span>

//           <span className="text-muted-foreground">Company</span>
//           <span>{values.formData.companyName || "—"}</span>

//           <span className="text-muted-foreground">Location</span>
//           <span>{values.formData.locationName || "—"}</span>

//           <span className="text-muted-foreground">Dates</span>
//           <span>
//             {values.formData.startDate || "—"}
//             {values.formData.endDate ? ` → ${values.formData.endDate}` : ""}
//           </span>

//           <span className="text-muted-foreground">Genre</span>
//           <span>{genreLabel || "—"}</span>

//           <span className="text-muted-foreground">Equipment</span>
//           <span>
//             {values.formData.equipment?.length
//               ? `${values.formData.equipment.length} item${values.formData.equipment.length === 1 ? "" : "s"} selected`
//               : "None selected"}
//           </span>
//         </div>
//       </div>

//       {/* ── Document upload ───────────────────────────────────────────── */}
//       <div className="space-y-3">
//         <div>
//           <p className="text-base font-medium">Supporting Documents</p>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             Upload any relevant documents. Files will be submitted with your
//             application.
//           </p>
//         </div>

//         {/* File list */}
//         {files.length > 0 && (
//           <ul className="space-y-2">
//             {files.map((file, index) => (
//               <li
//                 key={`${file.name}-${index}`}
//                 className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-base"
//               >
//                 <div className="flex items-center gap-2 min-w-0">
//                   <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
//                   <span className="truncate">{file.name}</span>
//                   <span className="shrink-0 text-sm text-muted-foreground">
//                     ({formatBytes(file.size)})
//                   </span>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => removeFile(index)}
//                   aria-label={`Remove ${file.name}`}
//                   className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}

//         {/* Hidden file input */}
//         <input
//           ref={inputRef}
//           type="file"
//           multiple
//           className="hidden"
//           onChange={handleFileChange}
//           aria-label="Upload documents"
//         />

//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => inputRef.current?.click()}
//         >
//           <Paperclip className="mr-2 h-4 w-4" />
//           {files.length > 0 ? "Add more files" : "Select files"}
//         </Button>
//       </div>

//       {/* ── Show after created checkbox ───────────────────────────────── */}
//       <FormField
//         control={form.control}
//         name="formData.showAfterCreated"
//         render={({ field }) => (
//           <FormItem>
//             <div className="flex items-center gap-3">
//               <FormControl>
//                 <Checkbox
//                   id="showAfterCreated"
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//               <Label
//                 htmlFor="showAfterCreated"
//                 className="text-base cursor-pointer font-normal"
//               >
//                 Show project after it&apos;s been created
//               </Label>
//             </div>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//   );
// }
