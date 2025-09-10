-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2025 at 01:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `notice_board`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `AdminId` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `AdminName` varchar(50) NOT NULL,
  `AdminMail` varchar(50) NOT NULL,
  `AdminPassword` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`AdminId`, `AdminName`, `AdminMail`, `AdminPassword`) VALUES
(4, 'niraj paradva', 'admin@gmail.com', 'AQAAAAIAAYagAAAAEBgoh3gNmR5nNIUUIJVcdOCggHJGnS4dBSag3+8ztgWWa7AdA5ivV/SmqDfzBSeubw=='),
(5, 'admin1', 'admin1@gmail.com', 'AQAAAAIAAYagAAAAEL6wEXVXCaTaYrycj85utDtQ21jmd7vsfhJT5/XQH316Bevg0owIu0tfzE1+b8HWXQ==');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `CourseId` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `CourseName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`CourseId`, `CourseName`) VALUES
(1, 'MCA'),
(2, 'BE');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `FacultyId` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `FacultyName` varchar(50) NOT NULL,
  `FacultyMail` varchar(50) NOT NULL,
  `FacultyPassword` longtext NOT NULL,
  `RequestStatus` tinyint(1) NOT NULL,
  `AddedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`FacultyId`, `FacultyName`, `FacultyMail`, `FacultyPassword`, `RequestStatus`, `AddedBy`) VALUES
(1, 'Ranchod_chanchad', 'faculty@gmail.com', 'AQAAAAIAAYagAAAAEEdqKUfXilAtbU6oYO7X6xqjfP8FEi6RPOS3AoGxOl3qW6SVM/KALFwPBOih9/aZ3Q==', 1, 4),
(3, 'facultyone', 'faculty1@gmail.com', 'AQAAAAIAAYagAAAAEE2BmqXn6THjrMu9YI4gMlIH/ok0Vd2BKeY1cFETnTm70ddJVORgmaloI79towi8/A==', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `notice`
--

CREATE TABLE `notice` (
  `NoticeId` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `NoticeTitle` varchar(255) NOT NULL,
  `NoticeDescription` longtext NOT NULL,
  `PublishedAt` datetime NOT NULL,
  `NoticeWrittenBy` int(11) NOT NULL,
  `AuthorType` varchar(10) NOT NULL,
  `Image` longtext DEFAULT NULL,
  `File` longtext DEFAULT NULL,
  `IsPinned` tinyint(1) NOT NULL,
  `Priority` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notice`
--

INSERT INTO `notice` (`NoticeId`, `NoticeTitle`, `NoticeDescription`, `PublishedAt`, `NoticeWrittenBy`, `AuthorType`, `Image`, `File`, `IsPinned`, `Priority`) VALUES
(1, 'second test with title and description', 'A small bakery in a bustling city was celebrating a milestone: its 100th customer of the day. The owner, David, had started the business with just $1,000 in savings and a passion for baking. Through word-of-mouth and positive online reviews, the bakery had steadily grown its customer base. On this special day, David decided to surprise the 100th customer with a free cake and a handwritten thank-you note. The gesture went viral on social media, with the hashtag #100thCustomer trending locally. In the following weeks, the bakery saw a 30% increase in foot traffic and online orders. David\'s simple act of kindness had not only delighted one customer but also created a ripple effect of positive publicity and increased sales.', '2025-09-09 14:54:31', 1, 'Admin', '', '', 1, 2),
(2, 'second test with title and description', 'A small bakery in a bustling city was celebrating a milestone: its 100th customer of the day. The owner, David, had started the business with just $1,000 in savings and a passion for baking. Through word-of-mouth and positive online reviews, the bakery had steadily grown its customer base. On this special day, David decided to surprise the 100th customer with a free cake and a handwritten thank-you note. The gesture went viral on social media, with the hashtag #100thCustomer trending locally. In the following weeks, the bakery saw a 30% increase in foot traffic and online orders. David\'s simple act of kindness had not only delighted one customer but also created a ripple effect of positive publicity and increased sales.', '2025-09-09 14:54:31', 1, 'Admin', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '', 1, 2),
(3, 'this test notice for image and file', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2025-09-09 13:12:29', 1, 'Faculty', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://oberheim.com/files/downloads/oberheim-temp-file.pdf', 0, 2),
(4, 'i need qa', 'i need 1 qa its difficulty to do all thing self', '2025-09-09 17:58:32', 3, 'Faculty', 'data:image/jpeg;base64,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', 'https://www.tutorialspoint.com/javascript/javascript_tutorial.pdf', 0, 1),
(5, 'testing an notice ', 'beacuse after some chnages that not work even i not touch that code', '2025-09-09 18:52:44', 3, 'Faculty', NULL, NULL, 0, 1),
(6, 'i mieesde in last test', 'hello baccho', '2025-09-09 18:55:07', 3, 'Faculty', NULL, NULL, 1, 1),
(7, 'lest check auto refresh thing in this', 'oho maje hay i hope this work', '2025-09-09 18:59:09', 3, 'Faculty', NULL, NULL, 0, 1),
(8, 'not auto refresh ', 'no its not dode', '2025-09-09 19:00:09', 3, 'Faculty', NULL, NULL, 0, 1),
(9, 'temp pdf notice', 'un\n1.\nthe main written part of a book, newspaper, etc. (not the pictures, notes, index, etc.)\nकिसी पुस्तक, अख़बार का मुख्य लिखित भाग (जिसमें चित्र, टिप्पणियाँ, अनुक्रमणिका आदि शामिल नहीं) मूल पाठ\n2.\nthe written form of a speech, interview, etc.\nकिसी भाषण, साक्षात्कार आदि का लिखित रूप\nThe newspaper printed the complete text of the interview.The newspaper printed the complete text of the interview.\na set text one that has to be studied for an examination\nverb\nto send somebody a written message using a mobile phone\nमोबाइल फ़ोन या चल भाष पर लिखित संदेश भेजना\nText me when you reach home.Text me when you reach home.\n', '2025-09-09 19:03:26', 3, 'Faculty', NULL, 'https://icseindia.org/document/sample.pdf', 0, 1),
(10, 'lets check after notice chnages', 'its done', '2025-09-09 19:04:26', 3, 'Faculty', NULL, NULL, 0, 1),
(11, 'work or no', 'i think no', '2025-09-09 19:05:39', 3, 'Faculty', NULL, NULL, 0, 1),
(12, 'ab kam karega', 'lets check', '2025-09-09 19:06:45', 3, 'Faculty', 'data:image/webp;base64,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', NULL, 0, 1),
(14, 'hello world', 'notice', '2025-09-09 19:18:41', 1, 'Faculty', NULL, NULL, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `StudentId` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `StudentName` varchar(50) NOT NULL,
  `StudentCourseId` int(11) NOT NULL,
  `StudentMail` varchar(50) NOT NULL,
  `StudentPassword` longtext NOT NULL,
  `ApprovedBy` int(11) DEFAULT NULL,
  `RequestStatus` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`StudentId`, `StudentName`, `StudentCourseId`, `StudentMail`, `StudentPassword`, `ApprovedBy`, `RequestStatus`) VALUES
(1, 'student', 1, 'student@gmail.com', 'AQAAAAIAAYagAAAAEBAtHkKC0hpLAPsRqQCWUzkwgLyOa1D0rr14Mx3BDA/Xu0MOgbGCE70yL6zKK4I52A==', 1, 1),
(2, 'student1', 2, 'student1@gmail.com', 'AQAAAAIAAYagAAAAEF/ONiEIs0NSCSOU5OV3+eCvP2ZSsGrCThCw7Ty81ygUYUjriy5ZZeP+dLoc75DxBw==', 3, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
-- Indexes for table `faculty`
ALTER TABLE `faculty`
  ADD KEY `facultyapprove` (`AddedBy`);

-- Indexes for table `notice`
ALTER TABLE `notice`
  ADD KEY `noticewritten` (`NoticeWrittenBy`);

-- Indexes for table `student`
ALTER TABLE `student`
  ADD KEY `studentapprove` (`ApprovedBy`);


--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `CourseId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `FacultyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notice`
--
ALTER TABLE `notice`
  MODIFY `NoticeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `StudentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `facultyapprove` FOREIGN KEY (`AddedBy`) REFERENCES `admin` (`AdminId`);

--
-- Constraints for table `notice`
--
ALTER TABLE `notice`
  ADD CONSTRAINT `noticewritten` FOREIGN KEY (`NoticeWrittenBy`) REFERENCES `faculty` (`FacultyId`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `studentapprove` FOREIGN KEY (`ApprovedBy`) REFERENCES `faculty` (`FacultyId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
