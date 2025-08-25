namespace Quick_Board_Backend.DTOs
{
    // Request DTO (no ID here)
    public class AdminCreateDto
    {
        public string AdminName { get; set; }
        public string AdminMail { get; set; }
        public string AdminPassword { get; set; }
    }

    // Response DTO (hides password, shows ID)
    public class AdminReadDto
    {
        public int AdminId { get; set; }
        public string AdminName { get; set; }
        public string AdminMail { get; set; }
    }
}
