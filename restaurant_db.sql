-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 28 mars 2026 à 17:20
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `restaurant_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(50) DEFAULT NULL,
  `table_id` bigint NOT NULL,
  `date_ouverture` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_cloture` timestamp NULL DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `total` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_facture` (`numero_facture`),
  KEY `table_id` (`table_id`)
) ENGINE=MyISAM AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `numero_facture`, `table_id`, `date_ouverture`, `date_cloture`, `statut`, `total`) VALUES
(44, 'FACT-20260327-0008', 4, '2026-03-27 09:42:33', '2026-03-27 17:06:26', 'PAYEE', 45000),
(43, 'FACT-20260327-0007', 2, '2026-03-27 09:40:37', NULL, 'EN_COURS', 52000),
(42, 'FACT-20260327-0006', 2, '2026-03-27 09:39:21', '2026-03-27 17:31:25', 'PAYEE', 73000),
(41, 'FACT-20260327-0005', 2, '2026-03-27 09:38:43', '2026-03-27 17:06:11', 'PAYEE', 73000),
(40, 'FACT-20260327-0004', 2, '2026-03-27 09:37:30', '2026-03-27 17:41:37', 'PAYEE', 73000),
(39, 'FACT-20260327-0003', 7, '2026-03-27 09:34:50', '2026-03-27 18:45:47', 'PAYEE', 88000),
(38, 'FACT-20260327-0002', 2, '2026-03-27 06:30:43', '2026-03-27 18:46:07', 'PAYEE', 65000),
(37, 'FACT-20260327-0001', 6, '2026-03-27 06:28:53', NULL, 'EN_COURS', 15000);

-- --------------------------------------------------------

--
-- Structure de la table `lignes_commande`
--

DROP TABLE IF EXISTS `lignes_commande`;
CREATE TABLE IF NOT EXISTS `lignes_commande` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `commande_id` bigint NOT NULL,
  `plat_id` bigint NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` double DEFAULT NULL,
  `total` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `commande_id` (`commande_id`),
  KEY `plat_id` (`plat_id`)
) ENGINE=MyISAM AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `lignes_commande`
--

INSERT INTO `lignes_commande` (`id`, `commande_id`, `plat_id`, `quantite`, `prix_unitaire`, `total`) VALUES
(64, 44, 11, 3, 15000, 45000),
(63, 43, 10, 1, 10000, 10000),
(62, 43, 5, 3, 14000, 42000),
(61, 42, 9, 1, 25000, 25000),
(60, 42, 8, 2, 24000, 48000),
(59, 41, 9, 1, 25000, 25000),
(58, 41, 8, 2, 24000, 48000),
(57, 40, 9, 1, 25000, 25000),
(56, 40, 8, 2, 24000, 48000),
(55, 39, 6, 2, 20000, 40000),
(54, 39, 8, 2, 24000, 48000),
(53, 38, 9, 1, 25000, 25000),
(52, 38, 6, 2, 20000, 40000),
(51, 37, 17, 1, 5000, 5000),
(50, 37, 18, 2, 5000, 10000);

-- --------------------------------------------------------

--
-- Structure de la table `menu`
--

DROP TABLE IF EXISTS `menu`;
CREATE TABLE IF NOT EXISTS `menu` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `prix` double NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `quantite` int DEFAULT '0',
  `disponible` tinyint(1) DEFAULT '1',
  `categorie` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `menu`
--

INSERT INTO `menu` (`id`, `nom`, `description`, `prix`, `image_url`, `quantite`, `disponible`, `categorie`) VALUES
(9, 'Soupe de nouilles', 'Bouillon chaud avec nouilles, légumes et parfois viande ou œufs.', 25000, '/uploads/47537511-3d59-45da-b628-31bcb1dcbf99.jpg', 10, 1, 'PLAT'),
(8, 'Soupe de crevettes', 'Soupe légère avec crevettes, souvent accompagnée d’épices ou citron.', 24000, '/uploads/f57b7f0c-09ab-4a1c-92e5-96ff9006de5d.jpg', 10, 1, 'PLAT'),
(6, 'Soupe de viande', 'Bouillon riche avec morceaux de viande (bœuf ou porc) et légumes.', 20000, '/uploads/7523160d-102b-4d91-ab19-3fba9d7ac01d.jpg', 10, 1, 'PLAT'),
(7, 'Frites au fromage', 'Frites garnies de fromage fondu (cheddar ou autre).', 13000, '/uploads/806d34c2-24b6-4107-b360-75695bb42d49.jpeg', 5, 1, 'ENTREE'),
(5, 'Frites à l’ail', 'Frites mélangées avec de l’ail haché et parfois du persil.', 14000, '/uploads/1935e2cd-78fa-4673-8d31-7730e2cf4d99.jpg', 7, 1, 'ENTREE'),
(10, 'Frites salées', 'Frites classiques assaisonnées avec du sel fin pour relever le goût.', 10000, '/uploads/8ce106e1-11c3-4243-9946-1ed9df1a478b.jpg', 4, 1, 'ENTREE'),
(11, 'Frite Nature', 'Pommes de terre coupées en bâtonnets, frites dans l’huile et légèrement salées.', 15000, '/uploads/f0156cb0-7fd8-43c9-a67e-ca09b0917851.jpg', 10, 1, 'ENTREE'),
(12, 'Glace', 'ddd', 3000, '/uploads/e68f3af7-c20b-4b2c-a618-c3b3a62124f7.jpg', 3, 1, 'DESSERT'),
(13, 'Glace Fraise', 'Glace fruitée et légèrement acidulée.', 3000, '/uploads/dd929890-1744-4de3-96d2-76218261488d.jpg', 7, 1, 'DESSERT'),
(14, 'Glace chocolat', 'Glace riche au cacao avec goût intense.', 3000, '/uploads/1a1191c9-84a1-456d-bad1-644e298268c2.jpg', 7, 1, 'DESSERT'),
(15, 'Glace Vanille', 'Glace douce et sucrée à base de vanille.', 3000, '/uploads/f226d1e7-1f93-4801-9256-831b6cc6150f.jpg', 3, 1, 'DESSERT'),
(16, 'Sambos', 'sdd', 20000, '/uploads/a8010957-e37a-4c19-a2d3-37b9da17bf39.jpg', 3, 1, 'ENTREE'),
(17, 'Gâteau vanille', 'Gâteau crémeux à base de vanille.', 5000, '/uploads/3f28c92a-3f31-48df-a35a-a767c0b96eee.jpg', 9, 1, 'DESSERT'),
(18, 'Gâteau chocolat', 'Gâteau moelleux au chocolat.', 5000, '/uploads/d65c6a6a-20e0-4ee6-b9dd-0ee3e4a4bac8.jpg', 8, 1, 'DESSERT'),
(19, 'Coca', 'Boisson gazeuse sucrée et rafraîchissante.', 2000, '/uploads/9113be28-40f7-4625-afca-aab8e216b2d6.jpg', 20, 1, 'BOISSON'),
(20, 'Pepsi', 'Boisson gazeuse sucrée et rafraîchissante.', 3000, '/uploads/d20d0c96-e69f-44ef-a474-d631e370a089.jpg', 20, 1, 'BOISSON'),
(21, 'Fanta', 'Boisson gazeuse sucrée et rafraîchissante.', 3000, '/uploads/953fdcc4-62ab-418e-99ad-1f21b57ff0b7.jpg', 10, 1, 'BOISSON'),
(22, 'Sprite', 'Boisson gazeuse sucrée et rafraîchissante.', 3000, '/uploads/9d9c0319-86f8-4f06-b23a-48da836e20e6.jpg', 20, 1, 'BOISSON'),
(23, 'Jus orange', 'jus naturel ranfraichissante\n', 2000, '/uploads/3c56d4f5-b0bf-4942-bef2-e086a331d303.jpg', 27, 1, 'BOISSON'),
(24, 'Pizza Pepperoni', 'Sauce tomate, fromage, tranches de pepperoni.', 30000, '/uploads/22d36eb5-3df1-4fc7-87c6-42f38e8323d5.jpg', 28, 1, 'PLAT'),
(25, 'Pizza Reine', 'Sauce tomate, fromage, jambon, champignons.', 30500, '/uploads/4f7dbd3d-c981-4de7-a0d9-9b20473bbbdf.jfif', 30, 1, 'PLAT'),
(26, 'Pizza Margherita', 'Sauce tomate, mozzarella, herbes.', 30000, '/uploads/2970c2a8-d880-4db3-8f16-cd53a66debe1.jfif', 26, 1, 'PLAT'),
(27, 'macaronii', 'fromage fondu, macaroni', 25000, '/uploads/2b6e7f4b-35fd-4230-91ca-cb1c5764cbbb.jpg', 29, 1, 'PLAT'),
(28, 'Pâtes au fromage', 'Pâtes avec sauce crémeuse au fromage.', 30000, '/uploads/57ae3adf-b6d4-4f8a-ae64-ba5a007be733.jpg', 19, 1, 'PLAT'),
(29, 'Pâtes bolognaise', 'Pâtes avec sauce tomate et viande hachée.', 30000, '/uploads/df8b2fd2-267b-45b6-8928-ecd5be40739a.jpg', 28, 1, 'PLAT'),
(30, 'Cheeseburger', 'Pain, steak, fromage fondu.', 30000, '/uploads/680cbacb-e635-4d80-85cf-e82057fbd082.jpg', 39, 1, 'PLAT'),
(31, 'Sandwich jambon-fromage', 'ain, jambon, fromage, beurre.', 19900, '/uploads/86dd9f59-333c-47cd-8a58-349bbcfed71d.jpg', 29, 1, 'PLAT'),
(32, 'panani', 'viande, salade, fromage, tomate', 30000, '/uploads/5988c4d5-8770-40a9-b5d7-bf9410e25577.jpg', 23, 1, 'PLAT'),
(33, 'Steak nature', 'viande grillée simplement assaisonnée (sel, poivre).', 30000, '/uploads/52dc5d32-cfd4-470e-8ad8-de550fdcf8a5.jpg', 20, 1, 'PLAT'),
(34, 'Steak aux œufs', 'Steak servi avec œuf au plat.\n', 29900, '/uploads/5c711121-8ae0-4a6c-94eb-ebba5381b649.jfif', 9, 1, 'PLAT'),
(35, 'Soupe chinoise au oeufs', '2oeufs, coriandre, pâtes', 14000, '/uploads/db312073-0092-43df-a5ff-f3c4e40cbcca.jpg', 37, 1, 'PLAT'),
(36, 'Sandwich poulet', 'Pain, poulet, salade, mayonnaise.', 30000, '/uploads/cef3dce3-33b9-4abd-b8aa-154963b017f6.jpg', 9, 1, 'PLAT'),
(37, 'Sandwich thon', 'Pain, thon, sauce, légumes.', 30000, '/uploads/ab855e2f-9c7c-4e63-9dfd-51e18c0e7ebb.jpg', 12, 1, 'PLAT'),
(38, 'Sandwich végétarien', 'Pain, légumes frais, sauce.', 30000, '/uploads/38535b1e-30ea-44ec-a2db-916dc4964a42.jpg', 10, 1, 'PLAT'),
(39, 'Milkshake fraise', 'Lait, glace fraise ou fruits frais.', 5000, '/uploads/866b3851-4066-43da-81dc-ed550ef91a90.jpg', 18, 1, 'DESSERT'),
(40, 'Café', 'Boisson chaude stimulante.', 3000, '/uploads/e3115eb8-2164-4810-af62-ded8dd21fa7c.jpg', 39, 1, 'BOISSON'),
(41, 'Thé', 'Boisson chaude ou froide, légère.', 3000, '/uploads/67a3dfa9-0b9e-4d54-a33f-67e1f5eace83.jpg', 43, 1, 'BOISSON'),
(42, 'Milkshake Oreo', 'Lait, glace vanille, biscuits Oreo mixés.', 4000, '/uploads/2eb7263c-ccb3-4455-9829-6d05c3bd4354.jpg', 14, 1, 'DESSERT'),
(43, 'Milkshake banane', 'Milkshake banane', 5000, '/uploads/827474e8-09ff-41b5-8763-fe0a2607a56e.jpg', 10, 1, 'DESSERT'),
(44, 'Fried shrimp', 'crevettes, pauvre, fromage', 30000, '/uploads/aa373407-c42f-4ee6-9ed8-78d69bcadab4.jpg', 9, 1, 'ENTREE'),
(45, 'Tempura de Crevettes', 'crevette, lait, fromage, creme fraiche', 20000, '/uploads/a3241678-79b2-4ca4-aeea-d898493ea8a6.jpg', 50, 1, 'ENTREE');

-- --------------------------------------------------------

--
-- Structure de la table `tables`
--

DROP TABLE IF EXISTS `tables`;
CREATE TABLE IF NOT EXISTS `tables` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `capacite` int NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tables`
--

INSERT INTO `tables` (`id`, `nom`, `capacite`, `status`) VALUES
(1, 'Table 1', 8, 'LIBRE'),
(2, 'Table 2', 4, 'LIBRE'),
(3, 'Table 3', 6, 'LIBRE'),
(4, 'Table 4', 2, 'LIBRE'),
(5, 'Table 5', 4, 'libre'),
(6, 'Table 6', 6, 'LIBRE'),
(7, 'Table 7', 5, 'LIBRE');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `email`, `password`, `role`) VALUES
(1, 'Jean Dupont', 'serveur@resto.com', 'password', 'SERVEUR'),
(2, 'Sophie Martin', 'manager@resto.com', 'password', 'MANAGER');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
