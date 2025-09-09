-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 09, 2025 at 03:28 PM
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
  `AdminId` int(11) NOT NULL,
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
  `CourseId` int(11) NOT NULL,
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
  `FacultyId` int(11) NOT NULL,
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
(1, 'faculty', 'faculty@gmail.com', 'AQAAAAIAAYagAAAAEEdqKUfXilAtbU6oYO7X6xqjfP8FEi6RPOS3AoGxOl3qW6SVM/KALFwPBOih9/aZ3Q==', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `notice`
--

CREATE TABLE `notice` (
  `NoticeId` int(11) NOT NULL,
  `NoticeTitle` varchar(255) NOT NULL,
  `NoticeDescription` longtext NOT NULL,
  `PublishedAt` datetime NOT NULL,
  `NoticeWrittenBy` int(11) NOT NULL,
  `AuthorType` varchar(10) NOT NULL,
  `Image` longtext NOT NULL,
  `File` longtext NOT NULL,
  `IsPinned` tinyint(1) NOT NULL,
  `Priority` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notice`
--

INSERT INTO `notice` (`NoticeId`, `NoticeTitle`, `NoticeDescription`, `PublishedAt`, `NoticeWrittenBy`, `AuthorType`, `Image`, `File`, `IsPinned`, `Priority`) VALUES
(1, 'second test with title and description', 'A small bakery in a bustling city was celebrating a milestone: its 100th customer of the day. The owner, David, had started the business with just $1,000 in savings and a passion for baking. Through word-of-mouth and positive online reviews, the bakery had steadily grown its customer base. On this special day, David decided to surprise the 100th customer with a free cake and a handwritten thank-you note. The gesture went viral on social media, with the hashtag #100thCustomer trending locally. In the following weeks, the bakery saw a 30% increase in foot traffic and online orders. David\'s simple act of kindness had not only delighted one customer but also created a ripple effect of positive publicity and increased sales.', '2025-09-09 14:54:31', 1, 'Admin', '', '', 1, 2),
(2, 'second test with title and description', 'A small bakery in a bustling city was celebrating a milestone: its 100th customer of the day. The owner, David, had started the business with just $1,000 in savings and a passion for baking. Through word-of-mouth and positive online reviews, the bakery had steadily grown its customer base. On this special day, David decided to surprise the 100th customer with a free cake and a handwritten thank-you note. The gesture went viral on social media, with the hashtag #100thCustomer trending locally. In the following weeks, the bakery saw a 30% increase in foot traffic and online orders. David\'s simple act of kindness had not only delighted one customer but also created a ripple effect of positive publicity and increased sales.', '2025-09-09 14:54:31', 1, 'Admin', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '', 1, 2),
(3, 'this test notice for image and file', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2025-09-09 13:12:29', 1, 'Faculty', 'https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://oberheim.com/files/downloads/oberheim-temp-file.pdf', 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `StudentId` int(11) NOT NULL,
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
(2, 'student1', 2, 'student1@gmail.com', 'AQAAAAIAAYagAAAAEF/ONiEIs0NSCSOU5OV3+eCvP2ZSsGrCThCw7Ty81ygUYUjriy5ZZeP+dLoc75DxBw==', NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminId`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`CourseId`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`FacultyId`),
  ADD KEY `facultyapprove` (`AddedBy`);

--
-- Indexes for table `notice`
--
ALTER TABLE `notice`
  ADD PRIMARY KEY (`NoticeId`),
  ADD KEY `noticewritten` (`NoticeWrittenBy`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudentId`),
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
  MODIFY `FacultyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notice`
--
ALTER TABLE `notice`
  MODIFY `NoticeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
