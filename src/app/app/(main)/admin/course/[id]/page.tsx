import { CourseView } from "@/app/_components/app/admin/courses/course/course";

type Props = {
  id: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function AdminCoursePage({ params }: PageProps) {
  const { id } = await params;

  return <CourseView id={id} />
}
