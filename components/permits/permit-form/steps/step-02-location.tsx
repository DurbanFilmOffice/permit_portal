// "use client";

// import type { UseFormReturn } from "react-hook-form";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   GENRE_OPTIONS,
//   type PermitFormValues,
// } from "@/lib/validations/permit-form.schema";

// interface Props {
//   form: UseFormReturn<PermitFormValues>;
// }

// export function Step02Location({ form }: Props) {
//   return (
//     <div className="space-y-6">
//       {/* Location Name */}
//       <FormField
//         control={form.control}
//         name="formData.locationName"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className="text-base font-medium">
//               Location Name <span className="text-destructive">*</span>
//             </FormLabel>
//             <FormControl>
//               <Input placeholder="Name of filming location" {...field} />
//             </FormControl>
//             <FormMessage className="text-sm" />
//           </FormItem>
//         )}
//       />

//       {/* Location Address */}
//       <FormField
//         control={form.control}
//         name="formData.locationAddress"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className="text-base font-medium">
//               Location Address <span className="text-destructive">*</span>
//             </FormLabel>
//             <FormControl>
//               <Input
//                 placeholder="Street address of filming location"
//                 {...field}
//                 onChange={(e) => {
//                   field.onChange(e);
//                   form.setValue("siteAddress", e.target.value);
//                 }}
//               />
//             </FormControl>
//             <FormMessage className="text-sm" />
//           </FormItem>
//         )}
//       />

//       {/* Applicant Contact Number */}
//       <FormField
//         control={form.control}
//         name="formData.applicantContactNumber"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className="text-base font-medium">
//               Contact Number <span className="text-destructive">*</span>
//             </FormLabel>
//             <FormControl>
//               <Input type="tel" placeholder="+27 00 000 0000" {...field} />
//             </FormControl>
//             <FormMessage className="text-sm" />
//           </FormItem>
//         )}
//       />

//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//         {/* Start Time */}
//         <FormField
//           control={form.control}
//           name="formData.startTime"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="text-base font-medium">
//                 Start Time <span className="text-destructive">*</span>
//               </FormLabel>
//               <FormControl>
//                 <Input type="time" {...field} />
//               </FormControl>
//               <FormMessage className="text-sm" />
//             </FormItem>
//           )}
//         />

//         {/* Wrap Time */}
//         <FormField
//           control={form.control}
//           name="formData.wrapTime"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="text-base font-medium">
//                 Wrap Time <span className="text-destructive">*</span>
//               </FormLabel>
//               <FormControl>
//                 <Input type="time" {...field} />
//               </FormControl>
//               <FormMessage className="text-sm" />
//             </FormItem>
//           )}
//         />
//       </div>

//       {/* Genre */}
//       <FormField
//         control={form.control}
//         name="formData.genre"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className="text-base font-medium">
//               Genre <span className="text-destructive">*</span>
//             </FormLabel>
//             <Select onValueChange={field.onChange} defaultValue={field.value}>
//               <FormControl>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a genre" />
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {GENRE_OPTIONS.map((option) => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <FormMessage className="text-sm" />
//           </FormItem>
//         )}
//       />
//     </div>
//   );
// }
