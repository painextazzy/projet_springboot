import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageTicket: 0,
    totalCustomers: 0,
    occupancyRate: 0,
    dailyChange: 0,
    weeklyChange: 0,
    monthlyChange: 0,
  });
  const [commandes, setCommandes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("day");
  const [topProducts, setTopProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [peakHour, setPeakHour] = useState({ hour: "", count: 0, revenue: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Service metrics states
  const [serviceMetrics, setServiceMetrics] = useState({
    currentServiceTime: 0, // Temps de la dernière commande (ouverture → clôture)
    activeOrders: 0,
  });
  const [orderDurationData, setOrderDurationData] = useState([0, 0, 0, 0, 0]);

  // Fonctions pour les dates dynamiques
  const getDateRangeText = () => {
    const now = new Date();
    if (timeFilter === "hour") {
      return `Heure actuelle, ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (timeFilter === "day") {
      return `Aujourd'hui, ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
    } else {
      return now.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    }
  };

  const getPeriodText = () => {
    if (timeFilter === "hour") return "Heure";
    if (timeFilter === "day") return "Jour";
    return "Mois";
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [commandesData, menuData, tablesData] = await Promise.all([
        api.getCommandes(),
        api.getMenu(),
        api.getTables(),
      ]);

      setCommandes(commandesData);
      setMenu(menuData);
      setTables(tablesData);

      calculateStats(commandesData);
      calculateTopProducts(commandesData);
      calculateStockStatus(menuData);
      calculateServiceMetrics(commandesData);
      calculatePeakHour(commandesData);

      if (timeFilter === "hour") {
        calculateHourlyData(commandesData);
      } else if (timeFilter === "day") {
        calculateDailyData(commandesData);
      } else {
        calculateMonthlyData(commandesData);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer la durée entre deux dates (retourne les minutes)
  const getDurationMinutes = (dateOuverture, dateCloture) => {
    const ouverture = new Date(dateOuverture);
    const cloture = new Date(dateCloture);
    const diffMs = cloture - ouverture;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes;
  };

  // Fonction pour formater la durée en minutes
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${heures} h`;
    }
    return `${heures} h ${mins} min`;
  };

  // Fonction pour calculer les métriques de service
  const calculateServiceMetrics = (commandesData) => {
    // Filtrer les commandes PAYEES qui ont une date de clôture
    const closedOrders = commandesData.filter(
      (cmd) => cmd.statut === "PAYEE" && cmd.dateCloture,
    );

    // Calculer la durée pour chaque commande (ouverture → clôture)
    const durations = closedOrders.map((cmd) => {
      return getDurationMinutes(cmd.dateOuverture, cmd.dateCloture);
    });

    // Dernière commande PAYEE (la plus récente) pour afficher son temps
    const lastPaidOrder =
      closedOrders.length > 0
        ? closedOrders.sort(
            (a, b) => new Date(b.dateCloture) - new Date(a.dateCloture),
          )[0]
        : null;

    const lastServiceTime = lastPaidOrder
      ? getDurationMinutes(
          lastPaidOrder.dateOuverture,
          lastPaidOrder.dateCloture,
        )
      : 0;

    // Commandes en cours (EN_COURS)
    const activeOrders = commandesData.filter(
      (cmd) => cmd.statut === "EN_COURS",
    ).length;

    setServiceMetrics({
      currentServiceTime: lastServiceTime,
      activeOrders,
    });

    // Distribution des temps de service
    const durationDistribution = [0, 0, 0, 0, 0]; // 0-15, 15-30, 30-45, 45-60, 60+ min
    durations.forEach((duration) => {
      if (duration <= 15) durationDistribution[0]++;
      else if (duration <= 30) durationDistribution[1]++;
      else if (duration <= 45) durationDistribution[2]++;
      else if (duration <= 60) durationDistribution[3]++;
      else durationDistribution[4]++;
    });

    setOrderDurationData(durationDistribution);
  };

  // Fonction pour calculer l'heure de pointe
  const calculatePeakHour = (commandesData) => {
    const hourStats = {};
    const now = new Date();

    let filteredCommandes = commandesData;

    if (timeFilter === "day") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= todayStart && cmdDate <= todayEnd;
      });
    } else if (timeFilter === "week") {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= startOfWeek;
      });
    } else if (timeFilter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= startOfMonth && cmdDate <= endOfMonth;
      });
    }

    filteredCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const hour = cmdDate.getHours();
      if (!hourStats[hour]) {
        hourStats[hour] = { count: 0, revenue: 0 };
      }
      hourStats[hour].count++;
      hourStats[hour].revenue += commande.total || 0;
    });

    let peakHourByCount = { hour: "", count: 0, revenue: 0 };

    for (const [hour, data] of Object.entries(hourStats)) {
      if (data.count > peakHourByCount.count) {
        peakHourByCount = {
          hour: `${hour}:00`,
          count: data.count,
          revenue: data.revenue,
        };
      }
    }

    const hourNum = parseInt(peakHourByCount.hour.split(":")[0]);
    const nextHour = hourNum + 1;

    setPeakHour({
      hour: `${hourNum}:30 - ${nextHour}:30`,
      count: peakHourByCount.count,
      revenue: peakHourByCount.revenue,
    });
  };

  const calculateStats = (commandesData) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const currentHour = now.getHours();
    const hourStart = new Date(now);
    hourStart.setHours(currentHour, 0, 0, 0);
    const hourEnd = new Date(now);
    hourEnd.setHours(currentHour, 59, 59, 999);

    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    let filteredCommandes = [];
    if (timeFilter === "hour") {
      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= hourStart && cmdDate <= hourEnd;
      });
    } else if (timeFilter === "day") {
      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= todayStart && cmdDate <= todayEnd;
      });
    } else {
      filteredCommandes = commandesData.filter((cmd) => {
        const cmdDate = new Date(cmd.dateOuverture);
        return cmdDate >= startOfMonth && cmdDate <= endOfMonth;
      });
    }

    const paidCommandes = filteredCommandes.filter(
      (cmd) => cmd.statut === "PAYEE",
    );
    const totalRevenue = paidCommandes.reduce(
      (sum, cmd) => sum + (cmd.total || 0),
      0,
    );
    const averageTicket =
      paidCommandes.length > 0 ? totalRevenue / paidCommandes.length : 0;
    const totalCustomers = filteredCommandes.length;

    const tablesOccupees = tables.filter(
      (table) => table.status && table.status.toUpperCase() === "OCCUPE",
    ).length;
    const occupancyRate =
      tables.length > 0
        ? Math.round((tablesOccupees / tables.length) * 100)
        : 0;

    let previousRevenue = 0;
    if (timeFilter === "hour") {
      const previousHourStart = new Date(now);
      previousHourStart.setHours(currentHour - 1, 0, 0, 0);
      const previousHourEnd = new Date(now);
      previousHourEnd.setHours(currentHour - 1, 59, 59, 999);
      previousRevenue = commandesData
        .filter(
          (cmd) =>
            cmd.statut === "PAYEE" &&
            new Date(cmd.dateOuverture) >= previousHourStart &&
            new Date(cmd.dateOuverture) <= previousHourEnd,
        )
        .reduce((sum, cmd) => sum + (cmd.total || 0), 0);
    } else if (timeFilter === "day") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(now.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      previousRevenue = commandesData
        .filter(
          (cmd) =>
            cmd.statut === "PAYEE" &&
            new Date(cmd.dateOuverture) >= yesterday &&
            new Date(cmd.dateOuverture) <= yesterdayEnd,
        )
        .reduce((sum, cmd) => sum + (cmd.total || 0), 0);
    } else {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      previousRevenue = commandesData
        .filter(
          (cmd) =>
            cmd.statut === "PAYEE" &&
            new Date(cmd.dateOuverture) >= lastMonthStart &&
            new Date(cmd.dateOuverture) <= lastMonthEnd,
        )
        .reduce((sum, cmd) => sum + (cmd.total || 0), 0);
    }

    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    setStats({
      dailyRevenue: totalRevenue,
      weeklyRevenue: timeFilter === "week" ? totalRevenue : 0,
      monthlyRevenue: timeFilter === "month" ? totalRevenue : 0,
      averageTicket,
      totalCustomers,
      occupancyRate,
      dailyChange: revenueChange,
      weeklyChange: timeFilter === "week" ? revenueChange : 0,
      monthlyChange: revenueChange,
    });
  };

  const calculateTopProducts = (commandesData) => {
    const productSales = {};

    commandesData.forEach((commande) => {
      if (commande.lignes && commande.lignes.length > 0) {
        commande.lignes.forEach((ligne) => {
          const productName = ligne.platNom || `Produit ${ligne.platId}`;

          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productName].quantity += ligne.quantite;
          productSales[productName].revenue += ligne.total;
        });
      }
    });

    const top5 = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    const maxRevenue = Math.max(...top5.map((p) => p.revenue), 1);
    top5.forEach((product) => {
      product.percentage = (product.revenue / maxRevenue) * 100;
    });

    setTopProducts(top5);
  };

  const calculateStockStatus = (menuData) => {
    const outOfStock = menuData.filter((item) => item.quantite === 0);
    const lowStock = menuData.filter(
      (item) => item.quantite > 0 && item.quantite < 5,
    );
    setOutOfStockProducts(outOfStock);
    setLowStockProducts(lowStock);
  };

  const calculateHourlyData = (commandesData) => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate >= todayStart && cmdDate <= todayEnd;
    });

    const hourStats = {};
    todayCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const hour = cmdDate.getHours();
      if (!hourStats[hour]) {
        hourStats[hour] = { revenue: 0, count: 0 };
      }
      hourStats[hour].revenue += commande.total || 0;
      hourStats[hour].count++;
    });

    const maxRevenue = Math.max(
      ...hours.map((h) => hourStats[h]?.revenue || 0),
      1,
    );
    const maxCount = Math.max(...hours.map((h) => hourStats[h]?.count || 0), 1);

    const data = hours.map((hour) => ({
      label: `${hour}:00`,
      revenue: hourStats[hour]?.revenue || 0,
      count: hourStats[hour]?.count || 0,
      revenuePercent: ((hourStats[hour]?.revenue || 0) / maxRevenue) * 100,
      countPercent: ((hourStats[hour]?.count || 0) / maxCount) * 100,
      isPeak:
        hourStats[hour]?.count ===
        Math.max(...Object.values(hourStats).map((h) => h.count)),
    }));

    setHourlyData(data);
  };

  const calculateDailyData = (commandesData) => {
    const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate >= startOfWeek;
    });

    const dayStats = {};
    days.forEach((_, index) => {
      dayStats[index] = { revenue: 0, count: 0 };
    });

    weekCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const day = cmdDate.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      if (dayStats[adjustedDay]) {
        dayStats[adjustedDay].revenue += commande.total || 0;
        dayStats[adjustedDay].count++;
      }
    });

    const maxRevenue = Math.max(
      ...Object.values(dayStats).map((d) => d.revenue),
      1,
    );
    const maxCount = Math.max(
      ...Object.values(dayStats).map((d) => d.count),
      1,
    );

    const data = days.map((day, index) => ({
      label: day,
      revenue: dayStats[index]?.revenue || 0,
      count: dayStats[index]?.count || 0,
      revenuePercent: ((dayStats[index]?.revenue || 0) / maxRevenue) * 100,
      countPercent: ((dayStats[index]?.count || 0) / maxCount) * 100,
      isPeak:
        dayStats[index]?.count ===
        Math.max(...Object.values(dayStats).map((d) => d.count)),
    }));

    setDailyData(data);
  };

  const calculateMonthlyData = (commandesData) => {
    const months = [
      "JAN",
      "FÉV",
      "MAR",
      "AVR",
      "MAI",
      "JUN",
      "JUL",
      "AOU",
      "SEP",
      "OCT",
      "NOV",
      "DÉC",
    ];
    const now = new Date();
    const currentYear = now.getFullYear();

    const yearCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate.getFullYear() === currentYear;
    });

    const monthStats = {};
    months.forEach((_, index) => {
      monthStats[index] = { revenue: 0, count: 0 };
    });

    yearCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const month = cmdDate.getMonth();
      if (monthStats[month]) {
        monthStats[month].revenue += commande.total || 0;
        monthStats[month].count++;
      }
    });

    const maxRevenue = Math.max(
      ...Object.values(monthStats).map((m) => m.revenue),
      1,
    );
    const maxCount = Math.max(
      ...Object.values(monthStats).map((m) => m.count),
      1,
    );

    const data = months.map((month, index) => ({
      label: month,
      revenue: monthStats[index]?.revenue || 0,
      count: monthStats[index]?.count || 0,
      revenuePercent: ((monthStats[index]?.revenue || 0) / maxRevenue) * 100,
      countPercent: ((monthStats[index]?.count || 0) / maxCount) * 100,
      isPeak:
        monthStats[index]?.count ===
        Math.max(...Object.values(monthStats).map((m) => m.count)),
    }));

    setMonthlyData(data);
  };

  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("fr-MG").format(price || 0).replace(/\s/g, "") +
      " Ar"
    );
  };

  const formatCompactPrice = (price) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + "M Ar";
    } else if (price >= 1000) {
      return (price / 1000).toFixed(0) + "k Ar";
    }
    return price + " Ar";
  };

  const filteredTopProducts = topProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentData =
    timeFilter === "hour"
      ? hourlyData
      : timeFilter === "day"
        ? dailyData
        : monthlyData;
  const dataLabel =
    timeFilter === "hour" ? "Heure" : timeFilter === "day" ? "Jour" : "Mois";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background font-body text-on-surface antialiased">
      <main className="min-h-screen">
        <section className="py-12 px-8 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold font-headline text-on-surface tracking-tight mb-2">
                Tableau de Bord Analytique
              </h2>
              <p className="text-secondary font-body">
                Performance détaillée du restaurant —{" "}
                <span className="text-primary font-medium">
                  {getDateRangeText()}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-surface-container-high p-1 rounded-2xl flex items-center">
                <button
                  onClick={() => setTimeFilter("hour")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "hour" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Heure
                </button>
                <button
                  onClick={() => setTimeFilter("day")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "day" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "month" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Mois
                </button>
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-secondary text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined text-lg">
                    calendar_today
                  </span>
                  {getDateRangeText()}
                </button>
              </div>
            </div>
          </div>

          {/* Bento Grid - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container text-white flex flex-col justify-between h-64 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em]">
                    Chiffre d'Affaire ({getPeriodText()})
                  </span>
                  <span className="material-symbols-outlined text-white/40">
                    trending_up
                  </span>
                </div>
                <h3 className="text-5xl font-extrabold font-headline mb-1 tracking-tighter">
                  {formatPrice(stats.dailyRevenue)}
                </h3>
                <p className="text-white/70 text-sm font-medium">
                  {stats.dailyChange > 0 ? "+" : ""}
                  {stats.dailyChange.toFixed(1)}% par rapport à{" "}
                  {timeFilter === "hour"
                    ? "l'heure précédente"
                    : timeFilter === "day"
                      ? "hier"
                      : "le mois dernier"}
                </p>
              </div>
              <div className="relative z-10 flex gap-1 items-end h-16">
                {currentData.slice(0, 7).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-white/20 rounded-t-sm"
                    style={{
                      height: `${Math.max(20, item.revenuePercent * 0.8)}%`,
                    }}
                  ></div>
                ))}
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10 flex flex-col justify-between h-64 hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined">
                    receipt_long
                  </span>
                </div>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">
                  Ticket Moyen
                </p>
                <h3 className="text-3xl font-bold font-headline text-on-surface">
                  {formatPrice(stats.averageTicket)}
                </h3>
              </div>
              <div className="text-xs font-medium text-primary flex items-center gap-1 bg-primary-fixed/30 px-3 py-1.5 rounded-full w-fit">
                <span className="material-symbols-outlined text-sm">
                  north_east
                </span>
                +{(stats.averageTicket * 0.07).toFixed(0)} Ar vs Moy.
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10 flex flex-col justify-between h-64 hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">
                  Couverts ({getPeriodText()})
                </p>
                <h3 className="text-3xl font-bold font-headline text-on-surface">
                  {stats.totalCustomers}
                </h3>
              </div>
              <div className="text-xs font-medium text-on-surface-variant px-3 py-1.5 rounded-full w-fit bg-surface-container">
                Taux d'occupation: {stats.occupancyRate}%
              </div>
            </div>
          </div>

          {/* Service Performance Section - UNIQUEMENT 2 CARTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Temps de service (dernière commande: ouverture → clôture) */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="text-white/80 text-xs uppercase tracking-wider">
                    Temps de service
                  </p>
                  <p className="text-3xl font-bold">
                    {formatDuration(serviceMetrics.currentServiceTime)}
                  </p>
                </div>
              </div>
              <div className="text-white/70 text-sm">
                Dernière commande (ouverture → clôture)
              </div>
            </div>

            {/* Commandes en cours */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <div>
                  <p className="text-white/80 text-xs uppercase tracking-wider">
                    Commandes en attente
                  </p>
                  <p className="text-3xl font-bold">
                    {serviceMetrics.activeOrders}
                  </p>
                </div>
              </div>
              <div className="text-white/70 text-sm">
                En attente de paiement
              </div>
            </div>
          </div>

          {/* Distribution des temps de service */}
          {orderDurationData.some((val) => val > 0) && (
            <div className="mb-8 p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xl font-bold font-headline text-on-surface mb-6">
                Distribution des temps de service
              </h4>
              <div className="grid grid-cols-5 gap-4">
                {[
                  "0-15 min",
                  "15-30 min",
                  "30-45 min",
                  "45-60 min",
                  "60+ min",
                ].map((label, index) => (
                  <div key={index} className="text-center">
                    <div className="h-32 flex items-end justify-center mb-2">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(10, (orderDurationData[index] / Math.max(...orderDurationData, 1)) * 120)}px`,
                          minHeight: "10px",
                        }}
                      >
                        {orderDurationData[index] > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                            {orderDurationData[index]} commandes
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-secondary">{label}</p>
                    <p className="text-sm font-bold text-primary">
                      {orderDurationData[index]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] text-secondary/70 mt-4">
                Nombre de commandes par tranche de temps de service
              </div>
            </div>
          )}

          {/* Enhanced Performance Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-bold font-headline text-on-surface">
                    Flux {dataLabel} Détaillé
                  </h4>
                  <p className="text-secondary text-sm">
                    Analyse des revenus et passages (
                    {timeFilter === "hour"
                      ? "08:00 - 22:00"
                      : timeFilter === "day"
                        ? "Lun - Dim"
                        : "Jan - Déc"}
                    )
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>{" "}
                    REVENU (Ar)
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-tertiary">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>{" "}
                    CLIENTS
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <div className="relative min-w-[800px] h-72 flex items-end justify-between px-4 pb-10">
                  <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-10 pointer-events-none">
                    <div className="border-b border-outline-variant/10 w-full h-0"></div>
                    <div className="border-b border-outline-variant/10 w-full h-0"></div>
                    <div className="border-b border-outline-variant/10 w-full h-0"></div>
                    <div className="border-b border-outline-variant/10 w-full h-0"></div>
                  </div>
                  {currentData.map((item, index) => {
                    const isPeak = item.isPeak;
                    return (
                      <div
                        key={index}
                        className="relative z-10 flex flex-col items-center gap-2 w-full group"
                      >
                        {isPeak && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="px-2 py-1 bg-on-surface text-white text-[9px] font-bold rounded-full mb-1 whitespace-nowrap">
                              {timeFilter === "hour"
                                ? "PIC DÉJEUNER"
                                : timeFilter === "day"
                                  ? "PIC HEBDOMADAIRE"
                                  : "PIC ANNUELLE"}
                            </span>
                            <div className="w-[1px] h-4 bg-on-surface/20"></div>
                          </div>
                        )}
                        <div className="flex gap-0.5 items-end h-44">
                          <div
                            className={`${isPeak ? "w-4 bg-primary" : "w-3 bg-primary-fixed-dim"} rounded-t-sm transition-all hover:bg-primary cursor-pointer relative`}
                            style={{
                              height: `${Math.max(15, item.revenuePercent)}%`,
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                              {formatPrice(item.revenue)}
                            </div>
                          </div>
                          <div
                            className={`${isPeak ? "w-4 bg-tertiary" : "w-3 bg-tertiary-fixed-dim"} rounded-t-sm relative`}
                            style={{
                              height: `${Math.max(10, item.countPercent)}%`,
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                              {item.count} clients
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold ${isPeak ? "text-on-surface" : "text-secondary"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Peak Performance Card */}
            <div className="p-8 rounded-[2rem] bg-on-surface text-white flex flex-col">
              <h4 className="text-xl font-bold font-headline mb-8">
                Performance de Pointe
              </h4>
              <div className="space-y-8 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      schedule
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      {timeFilter === "hour"
                        ? "Heure de Pointe"
                        : timeFilter === "day"
                          ? "Jour de Pointe"
                          : "Mois de Pointe"}
                    </p>
                    <p className="text-xl font-bold font-headline">
                      {timeFilter === "hour"
                        ? peakHour.hour
                        : timeFilter === "day"
                          ? currentData.find((d) => d.isPeak)?.label ||
                            "Vendredi"
                          : currentData.find((d) => d.isPeak)?.label ||
                            "Décembre"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      group
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      Affluence Max
                    </p>
                    <p className="text-xl font-bold font-headline">
                      {timeFilter === "hour"
                        ? `${Math.max(...currentData.map((d) => d.count))} Commandes`
                        : timeFilter === "day"
                          ? `${Math.max(...currentData.map((d) => d.count))} Clients`
                          : `${Math.max(...currentData.map((d) => d.count))} Commandes`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-white"
                      data-weight="fill"
                    >
                      star
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      Satisfaction Client (Moy)
                    </p>
                    <p className="text-xl font-bold font-headline">4.8 / 5.0</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">
                    Optimisation du personnel
                  </span>
                  <span className="font-bold">Excellent</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="w-[95%] h-full bg-primary-fixed rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Analysis Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Top Selling Item */}
            {topProducts[0] && (
              <div className="lg:col-span-1 p-8 rounded-[2rem] bg-surface-container-highest border border-outline-variant/5 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-widest mb-4">
                    Top Ventes ({getPeriodText()})
                  </span>
                  <h4 className="text-2xl font-bold font-headline text-on-surface leading-tight mb-2">
                    {topProducts[0].name}
                  </h4>
                  <p className="text-secondary text-sm">
                    Vendu {topProducts[0].quantity} fois
                  </p>
                </div>
                <div className="relative z-10 mt-4">
                  <div className="text-3xl font-extrabold font-headline text-primary">
                    {formatPrice(
                      topProducts[0].revenue / topProducts[0].quantity,
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                    Prix Unitaire
                  </p>
                </div>
              </div>
            )}

            {/* Menu Performance Table */}
            <div className="lg:col-span-3 p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold font-headline text-on-surface">
                  Menu Performance ({getPeriodText()})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-secondary text-[11px] font-bold uppercase tracking-widest border-b border-outline-variant/10">
                      <th className="pb-4 font-bold">Produit</th>
                      <th className="pb-4 font-bold">
                        Vol.{" "}
                        {timeFilter === "hour"
                          ? "Heure"
                          : timeFilter === "day"
                            ? "Jour"
                            : "Mois"}{" "}
                        de Pointe
                      </th>
                      <th className="pb-4 font-bold">Revenu Total</th>
                      <th className="pb-4 font-bold">Marge</th>
                      <th className="pb-4 text-right font-bold">Statut Flux</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {topProducts.map((product, index) => (
                      <tr
                        key={index}
                        className="group hover:bg-surface-container/30 transition-colors"
                      >
                        <td className="py-5 font-semibold text-on-surface">
                          {product.name.length > 30
                            ? product.name.substring(0, 27) + "..."
                            : product.name}
                        </td>
                        <td className="py-5 text-secondary">
                          {product.quantity}
                        </td>
                        <td className="py-5 font-medium">
                          {formatCompactPrice(product.revenue)}
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="w-[75%] h-full bg-primary"></div>
                            </div>
                            <span className="text-xs text-secondary">75%</span>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${index === 0 ? "bg-primary-fixed/30 text-primary" : index === 1 ? "bg-tertiary-fixed/40 text-tertiary" : "bg-surface-container text-secondary"}`}
                          >
                            {index === 0
                              ? "RAPIDE"
                              : index === 1
                                ? "PRIORITAIRE"
                                : "STABLE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Menu Épuisé et Stock Faible */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Menu Épuisé */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <h4 className="text-lg font-bold font-headline text-on-surface">
                    Menu Épuisé
                  </h4>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  {outOfStockProducts.length} produits
                </span>
              </div>
              {outOfStockProducts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {outOfStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-white/60 rounded-lg"
                    >
                      <span className="text-sm font-medium">{product.nom}</span>
                      <span className="text-xs text-red-500 font-semibold">
                        Épuisé
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-secondary">
                  Aucun produit épuisé
                </div>
              )}
            </div>

            {/* Stock Faible */}
            {lowStockProducts.length > 0 && (
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <span className="material-symbols-outlined">
                        inventory
                      </span>
                    </div>
                    <h4 className="text-lg font-bold font-headline text-on-surface">
                      Stock Faible
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    {lowStockProducts.length} produits
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-white/60 rounded-lg"
                    >
                      <span className="text-sm font-medium">{product.nom}</span>
                      <span className="text-xs text-amber-600 font-semibold">
                        Stock: {product.quantite}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0e3e5;
          border-radius: 10px;
        }
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
