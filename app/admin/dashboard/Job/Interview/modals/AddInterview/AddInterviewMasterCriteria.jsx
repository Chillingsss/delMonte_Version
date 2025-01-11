// "use client"
// import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import React, { useRef } from 'react'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
// import { Input } from '@/components/ui/input';
// import Spinner from '@/components/ui/spinner';

// function AddInterviewMasterCriteria({ open, onHide, addCriteria, criteriaList }) {
//   const [isLoading, setIsLoading] = React.useState(false);
//   const formSchema = z.object({
//     name: z.string().min(1, {
//       message: "This field is required",
//     }),
//     points: z.string().min(1, {
//       message: "This field is required",
//     }).refine((value) => !isNaN(Number(value)), {
//       message: "Points must be a number",
//     }),
//   });
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       points: "",
//     },
//   });

//   const nameInputRef = useRef(null);
//   const onSubmit = async (values) => {
//     alert("hello")
//     // setIsLoading(true);
//     // try {
//     //   if (criteriaList.some((element) => element.name === values.name)) {
//     //     toast.error("Criteria already exist");
//     //     return;
//     //   }
//     //   addCriteria(values);
//     //   toast.success("Criteria added successfully");
//     //   form.reset();
//     //   nameInputRef.current.focus();
//     // } catch (error) {
//     //   toast.error("Network error");
//     //   console.log("AddInterviewMasterCriteria.jsx => onSubmit(): " + error);
//     // } finally {
//     //   setIsLoading(false);
//     // }
//   };

//   return (
//     <div>
//       <Dialog open={open} onOpenChange={onHide}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Interview Criteria</DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <div className="flex justify-center items-center">
//                 <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Interview Criteria</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Enter interview criteria"
//                             {...field}
//                             ref={nameInputRef}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="points"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Points</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Enter points" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-cols gap-2 justify-end mt-5">
//                 <DialogClose asChild>
//                   <Button type="button" variant="outline">Close</Button>
//                 </DialogClose>
//                 <Button type="submit" disabled={isLoading}>{isLoading && <Spinner />} Submit</Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// export default AddInterviewMasterCriteria
