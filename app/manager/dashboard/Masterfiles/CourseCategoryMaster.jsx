import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddCourseCategoryMaster from './modal/AddMasterfileForms/AddCourseCategoryMaster';
import UpdateCourseCategory from './modal/UpdateMasterfileForms/UpdateCourseCategory';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';

const CourseCategoryMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  
  const addColumn = (values, newId) => {
    setData([...data, {
      course_categoryId: newId,
      course_categoryName: values.courseCategoryName
    }]);
  }

  // delete masterfile
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      handleDelete(selectedId);
    }
    setShowAlert(false);
  };
  const handleRemoveList = (dutyId) => {
    setSelectedId(dutyId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { courseCategoryId: selectedId }
      formData.append("operation", "deleteCourseCategory");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this course category");
      } else if (res.data === 1) {
        toast.success("Course category deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete course category");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("CourseCategoryMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Course Category", accessor: "course_categoryName", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateCourseCategory
            data={data}
            id={row.course_categoryId}
            currentName={row.course_categoryName}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.course_categoryId)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getCourseCategory");
      const res = await axios.post(url, formData);
      console.log("res.data ni course category: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("CourseCategoryMaster.jsx ~ getData ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <>
          <DataTable
            title="Course Category"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddCourseCategoryMaster
                title="course category"
                subject="courseCategory"
                data={data}
                getData={getData}
                addColumn={addColumn}
              />
            }
          />
        </>
      )}
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default CourseCategoryMaster