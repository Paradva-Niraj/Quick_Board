namespace Quick_Board_Backend.DTOs
{
    // Input when creating admin
    public class AdminCreateDto
    {
        public string AdminName { get; set; }
        public string AdminMail { get; set; }
        public string AdminPassword { get; set; }
    }

    // Output (don't show password)
    public class AdminReadDto
    {
        public int AdminId { get; set; }
        public string AdminName { get; set; }
        public string AdminMail { get; set; }
    }
}