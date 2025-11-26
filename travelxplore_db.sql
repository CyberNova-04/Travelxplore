-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: travelxplore_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `package_id` int NOT NULL,
  `guests` int NOT NULL,
  `travel_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Kishor','kkmkishor04@gmail.com','Appreciation','It was a amazing expirence','new','2025-11-17 12:28:19'),(2,'Cyber Nova','nova4fun@gmail.com','My Expirence','Out of the world amazing expirence. Thank you guys for this wonderfull expirence.','new','2025-11-18 07:38:56'),(3,'Nova','nova@gmail.com','my expirence','wonderful expirence','new','2025-11-18 09:29:08'),(4,'Nova','nova@gmail.com','my expirence','wonderful expirence','new','2025-11-18 09:29:45'),(5,'Nova','nova@gmail.com','my expirence','wonderful expirence','new','2025-11-18 09:30:10'),(6,'kishor','kkmkishor04@gmail.com','Thanking you','Guys, thanks for unforgotful memory','new','2025-11-23 17:53:06'),(7,'slayer','kkishor123@gmail.com','wonderful','Fuckin Awesome','new','2025-11-23 19:06:08');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinations`
--

DROP TABLE IF EXISTS `destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `full_description` text,
  `short_description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,2) DEFAULT '5.00',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinations`
--

LOCK TABLES `destinations` WRITE;
/*!40000 ALTER TABLE `destinations` DISABLE KEYS */;
INSERT INTO `destinations` VALUES (1,'Bali Paradise','Indonesia','Experience the magical island of Bali with its stunning beaches, ancient temples, and vibrant culture. Explore rice terraces, enjoy water sports, and immerse yourself in Balinese traditions.',NULL,'Tropical paradise with beautiful beaches and culture','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',1299.99,4.80,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(2,'Tokyo Lights','Japan','Discover the perfect blend of tradition and modernity in Tokyo. Visit ancient temples, experience cutting-edge technology, enjoy world-class cuisine, and explore vibrant neighborhoods.',NULL,'Modern metropolis meets ancient traditions','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',1899.99,4.90,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(3,'Paris Romance','France','Fall in love with the City of Light. Experience iconic landmarks, world-class museums, exquisite cuisine, and the romantic charm that makes Paris unforgettable.',NULL,'The city of love and art','https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',1699.99,4.70,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(4,'Dubai Luxury','UAE','Experience ultimate luxury in Dubai. Marvel at architectural wonders, shop in world-class malls, enjoy desert safaris, and experience the finest hospitality.',NULL,'Modern luxury in the desert','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',2199.99,4.80,0,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(5,'Maldives Beach','Maldives','Escape to paradise in the Maldives. Crystal-clear waters, white sandy beaches, luxury overwater villas, and incredible marine life await you.',NULL,'Tropical island paradise','https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',2499.99,5.00,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(6,'New York City','USA','Experience the city that never sleeps. From Broadway shows to world-class museums, iconic landmarks to diverse neighborhoods, NYC has it all.',NULL,'The Big Apple awaits','https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',1599.99,4.60,0,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(7,'Leh Ladakh ','India','Land of High Passes','Land of High Passes',NULL,'/uploads/1763924866456-385431198.jpg',1259.00,5.00,1,'2025-11-23 19:07:46','2025-11-23 19:51:28'),(9,'Patratu Valley','India','Lush green valley with winding roads, serene lake, breathtaking views, and adventurous drives near Ranchi. ','Lush green valley with winding roads, serene lake, breathtaking views, and adventurous drives near Ranchi. ',NULL,'/uploads/1764078801480-646469533.jpg',1000.00,5.00,1,'2025-11-25 13:53:21','2025-11-25 13:53:21');
/*!40000 ALTER TABLE `destinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES (1,'kkmkishor04@gmail.com','2025-11-23 15:30:20'),(54,'kavyakishor2004@gmail.com','2025-11-23 16:28:20'),(59,'killsdead04@gmail.com','2025-11-25 14:04:36');
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destination_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `duration_days` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `inclusions` text,
  `exclusions` text,
  `image` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '5.00',
  `max_guests` int DEFAULT '10',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_destination` (`destination_id`),
  KEY `idx_featured` (`featured`),
  CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,1,'Bali Beach & Culture Tour','Experience the best of Bali with this comprehensive tour covering beaches, temples, and local culture. Includes visits to Uluwatu Temple, Tanah Lot, Ubud Rice Terraces, and beach activities in Seminyak.',7,1299.99,'Accommodation,Daily breakfast,Airport transfers,Guided tours,Temple entrance fees','International flights,Lunch and dinner,Personal expenses,Travel insurance','https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',4.80,15,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(2,1,'Bali Adventure Package','An action-packed adventure in Bali featuring water sports, jungle trekking, white water rafting, and volcano hiking. Perfect for thrill-seekers.',5,999.99,'Accommodation,Breakfast,Adventure activities,Safety equipment,Professional guides','Flights,Meals except breakfast,Insurance,Tips','https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800',4.70,12,0,'2025-10-15 01:27:18','2025-11-23 14:16:10'),(3,2,'Tokyo Discovery Package','Explore Tokyo modern and traditional sides. Visit Senso-ji Temple, Tokyo Skytree, Shibuya, Akihabara, and enjoy authentic Japanese cuisine experiences.',6,1899.99,'Hotel accommodation,Daily breakfast,JR Pass 7 days,City tours,Cultural experiences','International flights,Lunch and dinner,Shopping,Personal expenses','https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800',4.90,10,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(4,3,'Paris Romantic Getaway','A romantic escape to Paris including Eiffel Tower visit, Seine River cruise, Louvre Museum tour, and intimate dining experiences in charming cafes.',5,1699.99,'Boutique hotel,Breakfast,Museum passes,River cruise,City tour','Flights,Lunches and dinners,Shopping,Additional activities','https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',4.70,8,1,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(5,4,'Dubai Luxury Experience','Live the high life in Dubai with stays in 5-star hotels, desert safari, Burj Khalifa visit, yacht cruise, and premium shopping experiences.',4,2199.99,'5-star accommodation,All meals,Desert safari,Burj Khalifa tickets,Yacht cruise,Airport transfers','International flights,Shopping,Spa treatments,Additional tours','https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',4.80,6,0,'2025-10-15 01:27:18','2025-10-15 01:27:18'),(6,5,'Maldives','The ultimate romantic getaway with overwater villa, private beach dinners, couple spa treatments, snorkeling, and sunset cruises.',5,2499.99,'','','https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',5.00,10,1,'2025-10-15 01:27:18','2025-11-24 12:44:35'),(8,7,'Naked Nights','Nude Beach Party',5,1269.00,'condoms\r\nlubes','vibrator\r\nlingrie','/uploads/1763994092427-654881899.jpg',5.00,6,1,'2025-11-24 14:21:32','2025-11-24 14:21:32');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@travelxplore.com','$2a$10$pMAgKvQaiYtQuGtcinGPAu35h33mP8Z5EhS7cnRVz75SdY/.I545O','Administrator','admin','2025-10-15 01:27:18','2025-10-15 01:43:03'),(2,'kishor123','kishor@gmail.com','$2a$10$pbpNCeR/HefaoiA0DoltE.YL0FKlonZVmnnraeIvaCc.iMmQTP8Ya','Kavya Kishor','user','2025-10-15 07:24:13','2025-10-15 07:24:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-25 22:56:06
