namespace Quick_Board_Backend.DTOs
{
    // When a student registers
    public class StudentRegisterDto
    {
        public string StudentName { get; set; }
        public string StudentMail { get; set; }
        public string StudentPassword { get; set; }
        public int StudentCourseId { get; set; }  // ✅ You missed this in your screenshot
    }

    // Response (don’t send password)
    public class StudentReadDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string StudentMail { get; set; }
        public bool RequestStatus { get; set; }
        public int? ApprovedBy { get; set; }
        public int StudentCourseId { get; set; }
        public string CourseName { get; set; }
        public string ApprovedByFaculty { get; set; }
    }

    // For approval
    public class StudentApprovalDto
    {
        public int FacultyId { get; set; } // ✅ Use FacultyId instead of ApprovedBy
    }
}
