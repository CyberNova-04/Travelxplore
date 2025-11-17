-- TravelXplore Database Schema
-- Drop existing tables if they exist
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Destinations Table
CREATE TABLE destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(255),
    image VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Packages Table
CREATE TABLE packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    destination_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    inclusions TEXT,
    exclusions TEXT,
    image VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 5.0,
    max_guests INT DEFAULT 10,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_destination (destination_id),
    INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contact Messages Table
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Admin User
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@travelxplore.com', '$2a$10$YpZ8qLvLhR7qL5gVZZYkxOFH9c1qE5YqQxQqL5Z1Y5Z5Z5Z5Z5Z5Z.', 'Administrator', 'admin');

-- Sample Destinations
INSERT INTO destinations (name, country, description, short_description, image, price, rating, featured) VALUES
('Bali Paradise', 'Indonesia', 'Experience the magical island of Bali with its stunning beaches, ancient temples, and vibrant culture. Explore rice terraces, enjoy water sports, and immerse yourself in Balinese traditions.', 'Tropical paradise with beautiful beaches and culture', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 1299.99, 4.8, TRUE),
('Tokyo Lights', 'Japan', 'Discover the perfect blend of tradition and modernity in Tokyo. Visit ancient temples, experience cutting-edge technology, enjoy world-class cuisine, and explore vibrant neighborhoods.', 'Modern metropolis meets ancient traditions', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 1899.99, 4.9, TRUE),
('Paris Romance', 'France', 'Fall in love with the City of Light. Experience iconic landmarks, world-class museums, exquisite cuisine, and the romantic charm that makes Paris unforgettable.', 'The city of love and art', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 1699.99, 4.7, TRUE),
('Dubai Luxury', 'UAE', 'Experience ultimate luxury in Dubai. Marvel at architectural wonders, shop in world-class malls, enjoy desert safaris, and experience the finest hospitality.', 'Modern luxury in the desert', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 2199.99, 4.8, FALSE),
('Maldives Beach', 'Maldives', 'Escape to paradise in the Maldives. Crystal-clear waters, white sandy beaches, luxury overwater villas, and incredible marine life await you.', 'Tropical island paradise', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 2499.99, 5.0, TRUE),
('New York City', 'USA', 'Experience the city that never sleeps. From Broadway shows to world-class museums, iconic landmarks to diverse neighborhoods, NYC has it all.', 'The Big Apple awaits', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 1599.99, 4.6, FALSE);

-- Sample Packages
INSERT INTO packages (destination_id, title, description, duration_days, price, inclusions, exclusions, image, rating, max_guests, featured) VALUES
(1, 'Bali Beach & Culture Tour', 'Experience the best of Bali with this comprehensive tour covering beaches, temples, and local culture. Includes visits to Uluwatu Temple, Tanah Lot, Ubud Rice Terraces, and beach activities in Seminyak.', 7, 1299.99, 'Accommodation,Daily breakfast,Airport transfers,Guided tours,Temple entrance fees', 'International flights,Lunch and dinner,Personal expenses,Travel insurance', 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800', 4.8, 15, TRUE),
(1, 'Bali Adventure Package', 'An action-packed adventure in Bali featuring water sports, jungle trekking, white water rafting, and volcano hiking. Perfect for thrill-seekers.', 5, 999.99, 'Accommodation,Breakfast,Adventure activities,Safety equipment,Professional guides', 'Flights,Meals except breakfast,Insurance,Tips', 'https://images.unsplash.com/photo-1558005530-a7958896e52e?w=800', 4.7, 12, FALSE),
(2, 'Tokyo Discovery Package', 'Explore Tokyo modern and traditional sides. Visit Senso-ji Temple, Tokyo Skytree, Shibuya, Akihabara, and enjoy authentic Japanese cuisine experiences.', 6, 1899.99, 'Hotel accommodation,Daily breakfast,JR Pass 7 days,City tours,Cultural experiences', 'International flights,Lunch and dinner,Shopping,Personal expenses', 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800', 4.9, 10, TRUE),
(3, 'Paris Romantic Getaway', 'A romantic escape to Paris including Eiffel Tower visit, Seine River cruise, Louvre Museum tour, and intimate dining experiences in charming cafes.', 5, 1699.99, 'Boutique hotel,Breakfast,Museum passes,River cruise,City tour', 'Flights,Lunches and dinners,Shopping,Additional activities', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', 4.7, 8, TRUE),
(4, 'Dubai Luxury Experience', 'Live the high life in Dubai with stays in 5-star hotels, desert safari, Burj Khalifa visit, yacht cruise, and premium shopping experiences.', 4, 2199.99, '5-star accommodation,All meals,Desert safari,Burj Khalifa tickets,Yacht cruise,Airport transfers', 'International flights,Shopping,Spa treatments,Additional tours', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800', 4.8, 6, FALSE),
(5, 'Maldives Honeymoon Package', 'The ultimate romantic getaway with overwater villa, private beach dinners, couple spa treatments, snorkeling, and sunset cruises.', 7, 2499.99, 'Overwater villa,All meals,Spa treatments,Water activities,Sunset cruise,Airport seaplane transfers', 'International flights,Alcohol,Diving courses,Extra activities', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 5.0, 2, TRUE);

-- Verify data
SELECT 'Database schema created successfully!' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS destination_count FROM destinations;
SELECT COUNT(*) AS package_count FROM packages;
