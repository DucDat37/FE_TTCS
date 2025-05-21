-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th5 21, 2025 lúc 05:30 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ttcs`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patientId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `timeSlotId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `serviceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctors`
--

CREATE TABLE `doctors` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `specialtyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `description` text DEFAULT NULL,
  `degree` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `doctors`
--

INSERT INTO `doctors` (`id`, `userId`, `specialtyId`, `description`, `degree`, `createdAt`, `updatedAt`) VALUES
('2341af6f-bc68-429a-931e-2de3d6cfaf95', '50e57f09-1cb4-486d-8d95-25501002f81f', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'Ths, Bác sĩ', '2025-05-21 15:23:00', '2025-05-21 15:23:18'),
('39c6c3b3-b873-4229-9dad-51a0fa4dda20', '74f99e09-c2c3-4146-9120-a83ff1836811', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'TS, Bác sĩ', '2025-05-21 14:41:34', '2025-05-21 14:47:16'),
('64c9c816-0dc6-4879-b5ee-016c29be5d13', '57900503-29fc-4178-9c82-13b2451679b8', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Phó Giám Đốc Bệnh Viện', 'PGS, TS, Bác sĩ', '2025-05-21 14:34:08', '2025-05-21 14:47:07'),
('88cb6912-063d-43e0-aeca-5256b6eb1033', '21b0bfa7-726f-4fcc-82c4-dfbfeea50881', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'ThS, Bác sĩ', '2025-05-21 15:27:12', '2025-05-21 15:27:45'),
('89d87f8f-587c-456c-bac3-613fc07c9acf', '165951b3-334b-44cd-a969-82fbd6c799d2', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'Bác sĩ', '2025-05-21 15:21:43', '2025-05-21 15:23:25'),
('8cdf2070-783d-4a12-871b-fefb066c2935', 'befa87e5-e1ce-4a86-9049-c05d7e5c96aa', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Phó khoa Tiêu Hóa', 'Bác sĩ', '2025-05-21 15:25:26', '2025-05-21 15:25:48'),
('90e1b3af-edee-4e66-906a-c6ae46a14791', '13a4f55b-5f45-4b86-96c5-7286bcc918bf', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'Bác sĩ', '2025-05-21 15:17:44', '2025-05-21 15:19:38'),
('a01f9c71-5426-4465-9d01-ee76282a2790', '642f3a15-e2d6-4c82-b458-dc6d43476650', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'ThS, Bác sĩ', '2025-05-21 14:45:51', '2025-05-21 14:47:27'),
('a43f8aeb-8d7d-4115-a3aa-e484054a5a91', 'd9fd6c02-093b-4a6b-a74b-ae2a558694af', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'Bác sĩ', '2025-05-21 14:43:53', '2025-05-21 14:44:04'),
('f077a295-8362-45a6-88c3-2d5f4d3ecdbd', '1df0f97d-bfcb-4418-9b77-475b0a97e5c3', '032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Bác sĩ chuyên khoa', 'Bác sĩ', '2025-05-21 15:19:19', '2025-05-21 15:19:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoices`
--

CREATE TABLE `invoices` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `appointmentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medicalappointments`
--

CREATE TABLE `medicalappointments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bookingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `medicalRecordId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medicalrecords`
--

CREATE TABLE `medicalrecords` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `prescription` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `news`
--

CREATE TABLE `news` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
('343c6d22-1e6c-414e-91e3-1109c4580668', 'Admin', '2025-05-21 03:17:47', '2025-05-21 03:17:47'),
('be7ebe5e-8506-4ffa-8fdb-75faff34cad5', 'User', '2025-05-21 03:17:47', '2025-05-21 03:17:47'),
('d33ee80f-ab2e-4844-97bc-7d03aefca25d', 'Doctor', '2025-05-21 03:17:47', '2025-05-21 03:17:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `name`, `price`, `description`, `createdAt`, `updatedAt`) VALUES
('27bc6168-fce5-4d47-a20e-9e73fd8aebff', 'Tầm soát nguy cơ đột quỵ', 1875000, '', '2025-05-21 14:30:53', '2025-05-21 14:30:53'),
('2e1b6b30-f6ba-4f94-8304-2c8963312ac4', 'Xét nghiệm đái tháo đường', 159000, '', '2025-05-21 14:29:23', '2025-05-21 14:29:23'),
('3bdf8add-e226-405b-aeae-44e868aaabbd', 'Đặt khám dạ dày và đại tràng', 200000, '<p>Trả lời bộ câu hỏi sàng lọc chuyên sâu chuẩn quốc tế</p><p>Đo chỉ số sinh hiệu: BMI, nhiệt độ, huyết áp, nhịp tim</p><p>Bác sĩ hỏi bệnh sử và chỉ định cận lâm sàng</p><p>Tư vấn kết quả và kê toa thuốc điều trị</p>', '2025-05-21 14:24:21', '2025-05-21 14:24:21'),
('816ad103-beae-4a3e-9c48-6dd07ef55171', 'Xét nghiệm chỉ dấu Ung thư', 750000, '<p>Chỉ Dấu Ung Thư Gan (AFP)</p><p>Xét Nghiệm Chỉ Dấu Ung Thư Buồng Trứng CA 125 (dành cho Nữ)</p><p>Xét Nghiệm Chỉ Dấu Ung Tuyến Tiền Liệt (PSA) (dành cho Nam)</p><p>Chỉ Dấu Ấn Ung Thư Đại Trực Tràng (CEA</p>', '2025-05-21 14:20:49', '2025-05-21 14:21:24'),
('ab7ab65c-7377-485c-94c3-7ed311babbc5', 'Nội soi dạ dày và đại tràng không đau', 6700000, '<ul><li>Đo Điện Tâm Đồ (Đo Điện Tim)</li><li>Thuốc Xổ Làm Sạch Đại Tràng (Hoặc Thụt Tháo Làm Sạch Đại Tràng)</li><li>An Thần Bệnh Nhân Nội Soi Đường Tiêu Hoá</li><li>Sinh Thiết Chẩn Đoán H.pylori (Làm Clo - Test)<br>Nội Soi Dạ Dày Không Đau<br>Nội Soi Đại', '2025-05-21 14:26:28', '2025-05-21 14:26:28'),
('c67afb32-4476-49b4-af2d-ff94560030b9', 'Tiêm ngừa Viêm gan B', 330000, '<p>Thông tin vắc xin: HEBERBIOVAC 1ML (CuBa)</p>', '2025-05-21 14:22:30', '2025-05-21 14:22:30'),
('dab87ced-8a09-48b8-aef2-0ed3c6d2522e', 'Gói khám tiểu đường', 720000, '', '2025-05-21 14:28:02', '2025-05-21 14:28:02'),
('dcb1d00a-96e8-4c0b-a2f7-6de7092079c8', 'Gói xét nghiệm máu cơ bản', 1670000, '', '2025-05-21 14:29:53', '2025-05-21 14:29:53'),
('ef52b887-a24a-43a9-8551-04995975bffd', 'Tiêm ngừa Viêm gan B', 330000, '<p>Thông tin vắc xin: HEBERBIOVAC 1ML (CuBa)</p>', '2025-05-21 14:18:44', '2025-05-21 14:22:30'),
('faa35126-313d-4ba2-8f40-8b40b876a56a', 'Xét nghiệm sinh sản nữ', 1340000, '', '2025-05-21 14:28:46', '2025-05-21 14:28:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `specialties`
--

CREATE TABLE `specialties` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `specialties`
--

INSERT INTO `specialties` (`id`, `name`, `url`, `createdAt`, `updatedAt`) VALUES
('032d36dc-abec-49eb-8ddb-9f2cddc28e93', 'Tiêu hóa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836709/TTCS/x9w9ckih7uno0ttovmh8.webp', '2025-05-21 14:11:51', '2025-05-21 14:11:51'),
('03bb1574-ba87-434c-9873-357e95bdfe77', 'Đa khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836345/TTCS/omj4sot2tqqcchk4gdoe.webp', '2025-05-21 14:05:48', '2025-05-21 14:05:48'),
('058e1b70-8202-4bc8-b79a-e0b778b7f767', 'Nội thận', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836205/TTCS/xxeck5hqfme7bagtgncr.webp', '2025-05-21 14:03:27', '2025-05-21 14:03:27'),
('0c0e7dd9-e8e7-4843-ba98-3034f4d0f271', 'Tai - Mũi - Họng', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836227/TTCS/bzo64p7zc55ewgpxw6k2.webp', '2025-05-21 14:03:49', '2025-05-21 14:03:49'),
('0d7da17e-dabf-4de2-bb10-11ba75923134', 'Hô hấp', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836290/TTCS/g4rpqznjtwlotjlybm9j.webp', '2025-05-21 14:04:52', '2025-05-21 14:04:52'),
('170ef706-1faa-43cb-9770-00bdedf555d8', 'Ngoại tổng quát', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835592/TTCS/ecdf7zrdtxnozychqkay.webp', '2025-05-21 13:53:14', '2025-05-21 13:53:14'),
('234d642d-f076-4176-b902-4431a37b0c10', 'Nhãn khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835578/TTCS/f120lrzkcvuz2alnbugx.webp', '2025-05-21 13:53:00', '2025-05-21 13:53:00'),
('33853021-e6e6-4339-a74d-f8714a391eb8', 'Y học thể thao', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836400/TTCS/hkhetgv8o9cmqlrrldfx.webp', '2025-05-21 14:06:42', '2025-05-21 14:06:42'),
('35774f31-fab6-454d-857d-0af0b3d3e1d3', 'Ngoại lồng ngực', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836871/TTCS/tzoaguybv2hqn752aydc.webp', '2025-05-21 14:14:33', '2025-05-21 14:14:33'),
('38033c24-6e78-4b27-a17b-2b8913c1a31d', 'Nhi khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835456/TTCS/zdrbzgh3gkmbjs70camm.webp', '2025-05-21 13:50:58', '2025-05-21 13:50:58'),
('38eaecb1-29f7-4bd2-91fc-2092f066b5df', 'Sản phụ khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835645/TTCS/dpfpckgc9it4bcqishqv.webp', '2025-05-21 13:54:07', '2025-05-21 13:54:07'),
('44e22912-1dfc-4534-955a-3ce60f48aa0a', 'Ung bướu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836358/TTCS/rpjx9galnympn5nalg2a.webp', '2025-05-21 14:06:00', '2025-05-21 14:06:00'),
('683b16c2-6e54-4739-bb50-224f09c35ad0', 'Tim mạch', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835623/TTCS/l9kfngsweqacv3j6yrc6.webp', '2025-05-21 13:53:45', '2025-05-21 13:53:45'),
('72be2e4b-b2ec-4dcd-97bd-43c035e4ec8f', 'Ngoại tiết niệu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836690/TTCS/krntmo8dsvvw4hkxl6sk.webp', '2025-05-21 14:11:32', '2025-05-21 14:11:32'),
('76041420-f750-4dfd-b162-b2b033ce67c2', 'Xét nghiệm', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835670/TTCS/sbjgezmihrdkudy9jva2.webp', '2025-05-21 13:54:32', '2025-05-21 13:54:32'),
('7c9209fa-d0a9-45ba-bfad-c03f94d66e8e', 'Chấn thương chỉnh hình', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835562/TTCS/mal2r9chntipidt3osmo.webp', '2025-05-21 13:52:44', '2025-05-21 13:52:44'),
('7d9307ca-b80f-4ed8-8830-b0951f7f2fb0', 'Huyết học', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836302/TTCS/colydvtmu0u5o5ortags.webp', '2025-05-21 14:05:04', '2025-05-21 14:05:04'),
('80fa4f83-fa65-40fd-bfc2-60847d64dd8b', 'Tâm thần', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836268/TTCS/yarxlbilhwokfnprvdwm.webp', '2025-05-21 14:04:30', '2025-05-21 14:04:30'),
('81f6aecb-9835-47e3-9090-2fa735808371', 'Y học dự phòng', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835608/TTCS/aso6eavicjgifla3uh0u.webp', '2025-05-21 13:53:30', '2025-05-21 13:53:30'),
('8fea56c6-1a16-4449-9184-d0f4b42224de', 'Tâm lý', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836322/TTCS/zi9ms5thsnhvmykytnwm.webp', '2025-05-21 14:05:24', '2025-05-21 14:05:24'),
('9565a70d-7dea-4d68-bdcd-084297634981', 'Hồi sức - cấp cứu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836190/TTCS/boculg4fydptmeekapev.png', '2025-05-21 14:03:12', '2025-05-21 14:03:12'),
('96d97cf7-174c-4c96-822a-b1ebee06ab54', 'Cơ xương khớp', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836653/TTCS/p6fxtq7xv3j7s5fx0077.webp', '2025-05-21 14:10:56', '2025-05-21 14:10:56'),
('9b5d842f-baff-42c9-9317-abed700eff94', 'Nội tiết', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836255/TTCS/nge0kto8ncyzmsikl9rm.webp', '2025-05-21 14:04:17', '2025-05-21 14:04:17'),
('a6d0c167-8041-4062-b885-b9becbc6d662', 'Vô sinh hiếm muộn', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836678/TTCS/rq2zkihli3mszimvrwzi.webp', '2025-05-21 14:11:20', '2025-05-21 14:11:20'),
('a81ee2df-b1d5-4574-b2f8-c899700aff8c', 'Da liễu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836737/TTCS/q6x96mdicpla0a1m6x1n.webp', '2025-05-21 14:12:19', '2025-05-21 14:12:19'),
('ac22f2ff-9932-4a83-ace2-8b3826495b36', 'Truyền nhiễm', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835767/TTCS/tbai5m67ftzpxxn2vwxq.webp', '2025-05-21 13:56:10', '2025-05-21 13:56:10'),
('acad07a8-1a3c-440f-af7b-f550106f52cc', 'Lao - bệnh phổi', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836381/TTCS/ftu6uuywiraiqdbilpgd.webp', '2025-05-21 14:06:24', '2025-05-21 14:06:24'),
('bb06307b-4db4-4f36-9a58-d6fc614c2b16', 'Nội thần kinh', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836370/TTCS/dntxawn2gshpykyi4hk7.webp', '2025-05-21 14:06:12', '2025-05-21 14:06:12'),
('bed5cfc5-97f9-4c1e-85e6-5b2990716799', 'Thẩm mỹ', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836333/TTCS/klspieajkg3egsvpp82l.webp', '2025-05-21 14:05:35', '2025-05-21 14:05:35'),
('c85b9f5c-27a7-4459-a015-5611679f66aa', 'Lão khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836171/TTCS/xiay9mvkxjssjc3fw7fx.webp', '2025-05-21 14:02:53', '2025-05-21 14:02:53'),
('cadf1195-6deb-4de4-82f3-6dc1cbf5991d', 'Vật lý trị liệu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836781/TTCS/ocxabe7xvkw7riaeieor.webp', '2025-05-21 14:13:03', '2025-05-21 14:13:03'),
('cfe0ae4b-9614-4f41-9278-c2f0cfbc16dc', 'Ngôn ngữ trị liệu', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836764/TTCS/ctnlomalllf0am33cyz2.webp', '2025-05-21 14:12:46', '2025-05-21 14:12:46'),
('da746c6a-1fd0-44a2-ae2d-f0a91f4d6e6b', 'Răng - Hàm - Mặt', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836416/TTCS/s6oibsn4xlmrfbdczght.webp', '2025-05-21 14:06:59', '2025-05-21 14:06:59'),
('dcb10cb6-629c-4efe-8e8a-c1268dcf8da3', 'Gây mê hồi sức', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835717/TTCS/zhm6fhpme2xttvohr6ni.webp', '2025-05-21 13:55:19', '2025-05-21 13:55:19'),
('e6062bcc-7b35-47a6-b209-d4028494e018', 'Chẩn đoán hình ảnh', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836883/TTCS/el8xipens763vh4qb9nx.png', '2025-05-21 14:14:46', '2025-05-21 14:14:46'),
('ec25f851-93a4-435e-92b4-aad196bdf05e', 'Dinh dưỡng', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836699/TTCS/mig6pcqqdvulpl9cjbxq.webp', '2025-05-21 14:11:41', '2025-05-21 14:11:41'),
('f0ec8f06-2d09-41ee-bf2c-fe4ef7fd92d5', 'Ngoại thần kinh', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836391/TTCS/wev8mbnaashlqvx1n0eh.webp', '2025-05-21 14:06:33', '2025-05-21 14:06:33'),
('fadcbd22-dd24-4c57-9913-ff9545769c7f', 'Nam khoa', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747836665/TTCS/newdr53jcoerw8qgbe7b.webp', '2025-05-21 14:11:07', '2025-05-21 14:11:07'),
('fd0ca066-26ba-4d3c-8aac-9c1a0cc40c75', 'Y học cổ truyền', 'https://res.cloudinary.com/djanqnhdm/image/upload/v1747835686/TTCS/ww4iddr8n5bsxjwm2wl7.webp', '2025-05-21 13:54:48', '2025-05-21 13:54:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `timeslots`
--

CREATE TABLE `timeslots` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `timeslots`
--

INSERT INTO `timeslots` (`id`, `doctorId`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`) VALUES
('0b371cf2-879d-42b8-86fb-cc456d084ee8', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 09:10:00', '2025-05-21 09:40:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('237d9403-cdc3-4268-a146-92d4ce4d458e', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 08:30:00', '2025-05-21 09:00:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('3022a7d2-b608-4fb8-ad3a-4ab326136b67', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 02:20:00', '2025-05-21 02:50:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('480a9531-6d2c-48d2-9879-2b9414d69eed', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 03:40:00', '2025-05-21 04:10:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('65da5913-5cef-4469-bcae-742e82c1fb34', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 04:20:00', '2025-05-21 04:50:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('8f0541f3-b6c0-4070-ba1f-944a96782edd', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 11:10:00', '2025-05-21 11:40:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('97396169-6bd6-4cee-bba7-e85884615e4c', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 09:50:00', '2025-05-21 10:20:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('9933e7b7-93f8-4d97-97ee-c085d340f04e', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 07:50:00', '2025-05-21 08:20:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('9a0b6429-deb2-416b-9c3e-6b46985aaf05', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 03:00:00', '2025-05-21 03:30:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('a488c3e6-6b15-4aa1-b43f-3baa5ab1d09e', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 10:30:00', '2025-05-21 11:00:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('b745d26b-196e-4366-b033-8f9ad8aeeef7', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 01:40:00', '2025-05-21 02:10:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('cb87242d-b283-4a18-8a9f-a33055c2e83c', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 06:30:00', '2025-05-21 07:00:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('d8bf7d0c-35a3-4d82-82ad-428c19932335', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 07:10:00', '2025-05-21 07:40:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06'),
('e26ca40f-28a5-4202-9cb0-865fa299f4c9', '64c9c816-0dc6-4879-b5ee-016c29be5d13', '2025-05-21 01:00:00', '2025-05-21 01:30:00', 1, '2025-05-21 14:37:06', '2025-05-21 14:37:06');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birthDate` datetime DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `roleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `resetPasswordOTP` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `userName`, `email`, `phone`, `password`, `birthDate`, `gender`, `address`, `img`, `roleId`, `status`, `resetPasswordOTP`, `resetPasswordExpires`, `createdAt`, `updatedAt`) VALUES
('13a4f55b-5f45-4b86-96c5-7286bcc918bf', 'Hoàng Thị Thanh Thủy', 'htttTieuHoa@gmail.com', '0987945368', '$2b$10$wmcrDVLtWs5WnE4QPS7M1OzDpMt8A2ngAdkWlfSJfxj6OKfaz3PeW', '1989-01-21 00:00:00', 0, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/03487259-f72b-4e7e-b337-bd4b7d60d63b.jpg?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:17:44', '2025-05-21 15:17:44'),
('165951b3-334b-44cd-a969-82fbd6c799d2', 'Trần Ngọc Lưu Phương', 'tnlpTieuHoa@gmail.com', '0917976365', '$2b$10$uIPqbTikwdJWOIhqg./XjOujhLsydFrdoO.MON8G2hyj7FSAptCC2', '1980-09-12 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/66b8afcb-e3dc-4099-995c-48040df25b75.jpg?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:21:43', '2025-05-21 15:21:43'),
('1df0f97d-bfcb-4418-9b77-475b0a97e5c3', 'Nguyễn Thị Thanh Thùy', 'ntttTieuHoa@gmail.com', '0966122064', '$2b$10$mi3ix2s6n/FHcAbe7Qiis.nlFLKlwgS6ZiSW962HcRxk3Wr/kZOQu', '1976-12-08 00:00:00', 0, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/f9789473-6b8f-436a-84f4-51f031be24f0.jpg?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:19:19', '2025-05-21 15:19:19'),
('21b0bfa7-726f-4fcc-82c4-dfbfeea50881', 'Phạm Trương Đính', 'ptdTieuHoa@gmail.com', '0332646324', '$2b$10$Y8DzY3OE7JzW9xVnBIOWy.oZWJV5Zwtd0dpMGHbGXmEQMXUwv/tdi', '2000-05-29 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/76fcb57d-5bfc-4628-9f59-fa57b3b3d54a.png?width=360', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:27:12', '2025-05-21 15:27:25'),
('2f9106cb-a5f9-4542-9d89-702912abc2d0', 'DucDat', 'ttd090204@gmail.com', '0385550840', '$2b$10$UREZDszhwXv/2ecNO7oafOu1EHDaHhTNJkgFRA8j/HJbCqKTNwd/y', NULL, NULL, NULL, 'https://i.pinimg.com/474x/7c/c7/a6/7cc7a630624d20f7797cb4c8e93c09c1.jpg', '343c6d22-1e6c-414e-91e3-1109c4580668', 1, NULL, NULL, '2025-05-21 03:21:04', '2025-05-21 03:21:04'),
('3b9e9af6-0992-45db-81c6-6a244d21d5ec', 'Admin', 'admin@example.com', '0123456789', '$2b$10$ZqEhVCp7.NsDZQiK3g2eBuPSLf6c5rHH6A7qaUxQ7LNfsCNEVBfPy', '1990-01-01 00:00:00', 1, 'Hà Nội', NULL, '343c6d22-1e6c-414e-91e3-1109c4580668', 1, NULL, NULL, '2025-05-21 03:17:47', '2025-05-21 03:17:47'),
('50e57f09-1cb4-486d-8d95-25501002f81f', 'Tô Thị Tình', 'tttTieuHoa@gmail.com', '0964036812', '$2b$10$4e.Jh7X6mVh.vOoR9unBceMRAb7tl4ScSl4kSDRWIxuZi0mmIfJ5a', '1991-05-06 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/907d4df7-57e8-484b-b618-2580700fff61.png?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:23:00', '2025-05-21 15:23:00'),
('57900503-29fc-4178-9c82-13b2451679b8', 'Lâm Việt Trung', 'ltvTieuhoa@gmail.com', '0345648210', '$2b$10$c9D7Up/XEeWrYutSAWEgZu79hv23U58vDbF8lq417KtK7AM0h2whC', '1982-02-03 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/4f01e016-00cf-498c-a82e-761393de038c.jpeg?width=360', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 14:34:08', '2025-05-21 14:34:08'),
('642f3a15-e2d6-4c82-b458-dc6d43476650', 'Vũ Thị Mai Uyên', 'vtmu@gmail.com', '0917945364', '$2b$10$URgzAigzgTrVALPAHnTKqeXooJgshvClREyiWxonqNv4YZPaiA1xe', '1990-09-03 00:00:00', 0, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/0b92b6dd-a7ab-40fe-8660-29f090b60185.jpg?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 14:45:51', '2025-05-21 14:45:51'),
('6dbd2062-1e16-4918-92d7-be4755d6aa84', 'User', 'user@example.com', '0111222333', '$2b$10$ZqEhVCp7.NsDZQiK3g2eBuPSLf6c5rHH6A7qaUxQ7LNfsCNEVBfPy', '1990-01-01 00:00:00', 1, 'Hà Nội', NULL, 'be7ebe5e-8506-4ffa-8fdb-75faff34cad5', 1, NULL, NULL, '2025-05-21 03:17:47', '2025-05-21 03:17:47'),
('74f99e09-c2c3-4146-9120-a83ff1836811', 'Lâm Nguyên Trung', 'lntTieuHoa@gmail.com', '0917945120', '$2b$10$07qLzAFTXsN7JZTkYyTEZ.QcxJbCVB0Dnbp3aU3KKk8t1STBAo6QG', '1985-07-13 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/579ab60d-d494-45db-8ac9-f4b9b67af637.jpg?width=160', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 14:41:34', '2025-05-21 14:41:34'),
('7dde1eef-4a55-422b-b553-9ca230ea6be8', 'Doctor', 'doctor@example.com', '0987654321', '$2b$10$ZqEhVCp7.NsDZQiK3g2eBuPSLf6c5rHH6A7qaUxQ7LNfsCNEVBfPy', '1990-01-01 00:00:00', 1, 'Hà Nội', NULL, 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 03:17:47', '2025-05-21 03:17:47'),
('befa87e5-e1ce-4a86-9049-c05d7e5c96aa', 'Bành Tấn Phong', 'btpTieuHoa@gmail.com', '0963832644', '$2b$10$MUJxGohZtdWCuQXMWov6tuWTgLLirACQnZJ0LhMaF4OvgsuHzow6O', '1970-04-11 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/5710da19-28da-4b79-bcff-31f98dd38b34.jpg?width=360', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 15:25:26', '2025-05-21 15:25:26'),
('d9fd6c02-093b-4a6b-a74b-ae2a558694af', 'Nguyễn Phước Thịnh', 'nptTieuHoa@gmail.com', '0385556622', '$2b$10$g3kFQ45HNdjYGftNMMqUpOEWVK0rGjlEtugMvst9B3Bq1N4.8sEU2', '1986-05-12 00:00:00', 1, 'Bệnh viện Đa khoa Hà Đông', 'https://cdn.youmed.vn/photos/b655f08c-4d5d-4d1f-ba8e-66e43c70a745.jpg?width=360', 'd33ee80f-ab2e-4844-97bc-7d03aefca25d', 1, NULL, NULL, '2025-05-21 14:43:53', '2025-05-21 14:43:53');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId` (`patientId`),
  ADD KEY `timeSlotId` (`timeSlotId`),
  ADD KEY `serviceId` (`serviceId`);

--
-- Chỉ mục cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `specialtyId` (`specialtyId`);

--
-- Chỉ mục cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointmentId` (`appointmentId`);

--
-- Chỉ mục cho bảng `medicalappointments`
--
ALTER TABLE `medicalappointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookingId` (`bookingId`),
  ADD KEY `medicalRecordId` (`medicalRecordId`);

--
-- Chỉ mục cho bảng `medicalrecords`
--
ALTER TABLE `medicalrecords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctorId` (`doctorId`);

--
-- Chỉ mục cho bảng `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `timeslots`
--
ALTER TABLE `timeslots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctorId` (`doctorId`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `roleId` (`roleId`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`timeSlotId`) REFERENCES `timeslots` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`patientId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`timeSlotId`) REFERENCES `timeslots` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `doctors_ibfk_2` FOREIGN KEY (`specialtyId`) REFERENCES `specialties` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `doctors_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `doctors_ibfk_4` FOREIGN KEY (`specialtyId`) REFERENCES `specialties` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`appointmentId`) REFERENCES `medicalappointments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`appointmentId`) REFERENCES `medicalappointments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `medicalappointments`
--
ALTER TABLE `medicalappointments`
  ADD CONSTRAINT `medicalappointments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `medicalappointments_ibfk_2` FOREIGN KEY (`medicalRecordId`) REFERENCES `medicalrecords` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `medicalappointments_ibfk_3` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `medicalappointments_ibfk_4` FOREIGN KEY (`medicalRecordId`) REFERENCES `medicalrecords` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `medicalrecords`
--
ALTER TABLE `medicalrecords`
  ADD CONSTRAINT `medicalrecords_ibfk_1` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `medicalrecords_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `news_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `news_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `timeslots`
--
ALTER TABLE `timeslots`
  ADD CONSTRAINT `timeslots_ibfk_1` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timeslots_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
