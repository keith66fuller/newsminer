-- MySQL dump 10.13  Distrib 8.0.11, for Win64 (x86_64)
--
-- Host: zf4nk2bcqjvif4in.cbetxkdyhwsb.us-east-1.rds.amazonaws.com    Database: gl7htl0662syql2q
-- ------------------------------------------------------
-- Server version	5.7.19-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ApiCounters`
--

DROP TABLE IF EXISTS `ApiCounters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ApiCounters` (
  `date` date NOT NULL,
  `counter` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ApiCounters`
--

LOCK TABLES `ApiCounters` WRITE;
/*!40000 ALTER TABLE `ApiCounters` DISABLE KEYS */;
INSERT INTO `ApiCounters` VALUES ('2018-06-01',73,'2018-06-01 18:35:52','2018-06-01 23:21:41');
/*!40000 ALTER TABLE `ApiCounters` ENABLE KEYS */;
UNLOCK TABLES;
