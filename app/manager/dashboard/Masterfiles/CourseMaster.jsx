import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import UpdateCourse from './modal/UpdateMasterfileForms/UpdateCourse';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';
import AddCourseMaster from './modal/AddMasterfileForms/AddCourseMaster';

const CourseMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      courses_id: newId,
      courses_name: values.courseName,
      course_categoryName: values.courseCategory,
      crs_type_name: values.courseType
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
  const handleRemoveList = (courseId) => {
    setSelectedId(courseId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { courseId: selectedId }
      formData.append("operation", "deleteCourse");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this course");
      } else if (res.data === 1) {
        toast.success("Course deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("CourseMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Course", accessor: "courses_name", sortable: true },
    { header: "Course Category", accessor: "course_categoryName", sortable: true },
    { header: "Course Description", accessor: "crs_type_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateCourse
            data={data}
            id={row.courses_id}
            courseCategoryId={row.course_categoryId}
            courseTypeId={row.crs_type_id}
            currentName={row.courses_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.courses_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getCourse");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("CourseMaster.jsx ~ getData ~ error:", error);
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
            title="Course"
            data={data}
            columns={columns}
            autoIndex={false}
            add={
              <AddCourseMaster
                title="course"
                getData={getData}
                data={data}
                addColumn={addColumn}
              />}
          />
        </>
      )}
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default CourseMaster