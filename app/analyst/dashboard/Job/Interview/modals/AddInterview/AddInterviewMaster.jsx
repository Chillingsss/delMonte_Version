// "use client"
// import React, { useState } from 'react'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
// import { Input } from '@/components/ui/input';
// import Spinner from '@/components/ui/spinner';
// import axios from 'axios';
// import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// import { Separator } from '@/components/ui/separator';
// import { Card, CardContent } from '@/components/ui/card';
// import { Edit2, PlusCircle, Trash2 } from 'lucide-react';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import AddInterviewMasterCriteria from './AddInterviewMasterCriteria';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import ShowAlert from '@/components/ui/show-alert';
// import { retrieveData } from '@/app/utils/storageUtils';
// import UpdateInterviewCriteria from '../UpdateInterview/UpdateInterviewCriteria';

// function AddInterviewMaster({ open, onHide }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [interviewCriteria, setInterviewCriteria] = useState([]);

//   const [isAddCriteriaMasterOpen, setIsAddCriteriaMasterOpen] = useState(false);
//   const openAddCriteriaMaster = () => setIsAddCriteriaMasterOpen(true);
//   const closeAddCriteriaMaster = () => { setIsAddCriteriaMasterOpen(false); };

//   const addCriteria = (status) => {
//     setInterviewCriteria([...interviewCriteria, { name: status.name, points: status.points }]);
//   }

//   const [alertMessage, setAlertMessage] = useState("");
//   const [showAlert, setShowAlert] = useState(false);
//   const [indexToRemove, setIndexToRemove] = useState(null);
//   const handleShowAlert = (message) => {
//     setAlertMessage(message);
//     setShowAlert(true);
//   };
//   const handleCloseAlert = (status) => {
//     if (status === 1) {
//       toast.success("Criteria deleted successfully");
//       const filteredData = interviewCriteria.filter((element) => element !== interviewCriteria[indexToRemove]);
//       setInterviewCriteria(filteredData);
//     }
//     setShowAlert(false);
//   };
//     const handleRemoveList = (indexToRemove) => {
//     setIndexToRemove(indexToRemove);
//     handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
//   };


//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [selectedData, setSelectedData] = useState({});
//   const openUpdateModal = (index, data) => {
//     setShowUpdateModal(true);
//     setSelectedIndex(index);
//     setSelectedData(data);
//   }
//   const closeUpdateModal = (status) => {
//     if (status !== 0) {
//       let criteriaList = interviewCriteria;
//       criteriaList[selectedIndex] = { name: status.name, points: status.points };
//       setInterviewCriteria(criteriaList);
//     }
//     setShowUpdateModal(false);
//     setSelectedIndex(0);
//   }

//   const formSchema = z.object({
//     passingPercentage: z.string().min(1, {
//       message: "This field is required",
//     }).refine((value) => !isNaN(Number(value)), {
//       message: "Percentage must be a number",
//     }).refine((value) => value >= 0, {
//       message: "Percentage must not be less than 0",
//     }),
//   });

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       passingPercentage: "",
//     },
//   });

//   const onSubmit = async (values) => {
//     setIsLoading(true);
//     try {
//       if (interviewCriteria.length === 0) {
//         toast.error("Please add interview criteria");
//         return;
//       }
//       const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
//       const formData = new FormData();
//       const jsonData = {
//         master: { jobId: retrieveData("jobId"), passingPercentage: values.passingPercentage },
//         detail: interviewCriteria,
//       };
//       formData.append("operation", "addInterviewMaster");
//       formData.append("json", JSON.stringify(jsonData));
//       const res = await axios.post(url, formData);
//       console.log("res.data ni onSubmit:", res.data);
//       if (res.data === 1) {
//         toast.success("Master added successfully");
//         onHide(values);
//         form.reset();
//       }
//     } catch (error) {
//       toast.error("Network error");
//       console.log("AddInterviewCriteria.jsx => onSubmit(): " + error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOnHide = () => {
//     onHide(0);
//   };

//   return (
//     <div>
//       <Sheet open={open} onOpenChange={handleOnHide}>
//         <SheetContent side="bottom">
//           <SheetHeader>
//             <SheetTitle>Add Interview Master</SheetTitle>
//           </SheetHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <div className="flex justify-center items-center">
//                 <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
//                   <FormField
//                     control={form.control}
//                     name="passingPercentage"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Passing Percentage</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Enter passing percentage" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Separator />
//                   <Button type="button" onClick={openAddCriteriaMaster}>
//                     <PlusCircle className='h-5 w-5 mr-1' /> Add criteria
//                   </Button>
//                   <Card className="flex items-center justify-center">
//                     <ScrollArea className="flex items-center justify-center w-full">
//                       <CardContent>
//                         {interviewCriteria.length > 0 ? (
//                           <Table className="w-full">
//                             <TableCaption>{interviewCriteria.length} criteria added</TableCaption>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Criteria</TableHead>
//                                 <TableHead>Points</TableHead>
//                                 <TableHead></TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {interviewCriteria.map((item, index) => (
//                                 <TableRow key={index}>
//                                   <TableCell>{item.name}</TableCell>
//                                   <TableCell>{item.points}</TableCell>
//                                   <TableCell className='flex items-center justify-center gap-4'>
//                                     <Edit2 onClick={() => openUpdateModal(index, item)} className='h-4 w-4 cursor-pointer' />
//                                     <Trash2 onClick={() => handleRemoveList(index)} className='h-4 w-4 cursor-pointer' />
//                                   </TableCell>
//                                 </TableRow>
//                               ))}
//                             </TableBody>
//                           </Table>
//                         ) : (
//                           <p className="text-center mt-4">No criteria added yet</p>
//                         )}
//                       </CardContent>
//                     </ScrollArea>
//                   </Card>
//                 </div>
//               </div>
//               <div className="flex flex-cols gap-2 justify-end mt-5">
//                 <SheetClose asChild>
//                   <Button type="button" variant="outline">Cancel</Button>
//                 </SheetClose>
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading && <Spinner />} Submit
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </SheetContent>
//       </Sheet>
//       {isAddCriteriaMasterOpen && (
//         <AddInterviewMasterCriteria
//           open={isAddCriteriaMasterOpen}
//           onHide={closeAddCriteriaMaster}
//           addCriteria={addCriteria}
//           criteriaList={interviewCriteria}
//         />
//       )}
//       {showUpdateModal && (
//         <UpdateInterviewCriteria
//           open={showUpdateModal}
//           onHide={closeUpdateModal}
//           data={selectedData}
//           criteriaList={interviewCriteria}
//           isMaster={true}
//         />
//       )}
//       {showAlert && (
//         <ShowAlert
//           open={showAlert}
//           onHide={handleCloseAlert}
//           message={alertMessage}
//         />
//       )}
//     </div>
//   );
// }

// export default AddInterviewMaster;
