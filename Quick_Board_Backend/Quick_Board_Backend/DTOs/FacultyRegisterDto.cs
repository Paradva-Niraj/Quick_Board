namespace Quick_Board_Backend.DTOs
{
    // Input when faculty registers
    public class FacultyRegisterDto
    {
        public string FacultyName { get; set; }
        public string FacultyMail { get; set; }
        public string FacultyPassword { get; set; }
    }

    // Output (don’t show password)
    public class FacultyReadDto
    {
        public int FacultyId { get; set; }
        public string FacultyName { get; set; }
        public string FacultyMail { get; set; }
        public bool RequestStatus { get; set; }
        public int? AddedBy { get; set; }
        public string? AddedByName { get; set; }
    }

    // Admin approves request
    public class FacultyApprovalDto
    {
        public int AdminId { get; set; }  // who approved
    }
}
