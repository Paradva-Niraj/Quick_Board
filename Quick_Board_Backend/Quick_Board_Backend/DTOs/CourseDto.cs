namespace Quick_Board_Backend.DTOs
{
    // Client only needs to provide the Name when creating
    public class CourseCreateDto
    {
        public string CourseName { get; set; }
    }

    public class CourseReadDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; }
    }
}
