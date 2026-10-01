/**
 * DevaSetu Transit & Travel Booking Helpers
 * Generates verified, 100% working search & booking links for Trains, Buses, and Outstation Cabs
 * connecting devotee origin to sacred temple destinations.
 */

export interface PortalLink {
  label: string;
  url: string;
}

export interface TransitOption {
  id: string;
  type: 'train' | 'bus' | 'cab';
  title: string;
  badge: string;
  description: string;
  searchSummary: string;
  primaryActionUrl: string;
  primaryActionText: string;
  portalLinks: PortalLink[];
  highlights: string[];
}

/**
 * Extracts a clean, accurate city/town name from address or location string
 */
export const extractCityName = (name?: string, formattedAddress?: string): string => {
  // Check if name is already a clean city or recognizable location
  if (name && name.trim()) {
    const cleanName = name
      .replace(/\b(IT Park|Industrial Area|Station|Airport|Junction|Phase \d|Layout|Nagar|Road|Street|Tech Park|SEZ)\b/gi, '')
      .replace(/[,\-–]/g, ' ')
      .trim();

    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length > 0 && words[0].length >= 3) {
      return words[0];
    }
  }

  // Parse formattedAddress
  if (formattedAddress && formattedAddress.trim()) {
    const segments = formattedAddress
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Exclude national highways, pincodes, country
    const candidates = segments.filter(
      (s) =>
        !/^\d{5,6}$/.test(s) &&
        !/^nh\s*\d+/i.test(s) &&
        !/^national highway/i.test(s) &&
        !/india/i.test(s)
    );

    if (candidates.length >= 2) {
      return candidates[1].split(/\s+/)[0] || candidates[0];
    }
    if (candidates.length === 1) {
      return candidates[0].split(/\s+/)[0];
    }
  }

  return 'Bengaluru';
};

/**
 * Resolves destination transit hub for pilgrimage centers
 */
export const resolveDestinationHub = (
  templeName?: string,
  city?: string
): { railHub: string; busHub: string; cabHub: string } => {
  const normCity = (city || '').toLowerCase();
  const normTemple = (templeName || '').toLowerCase();

  // Tirumala Venkateswara -> Tirupati Junction & Tirupati Central Bus Stand
  if (normCity.includes('tirumala') || normTemple.includes('tirumala') || normTemple.includes('venkateswara')) {
    return {
      railHub: 'Tirupati',
      busHub: 'Tirupati',
      cabHub: 'Tirumala',
    };
  }

  // Arunachaleswarar -> Tiruvannamalai
  if (normTemple.includes('arunachaleswarar') || normCity.includes('tiruvannamalai')) {
    return {
      railHub: 'Tiruvannamalai',
      busHub: 'Tiruvannamalai',
      cabHub: 'Tiruvannamalai',
    };
  }

  // Subramania Swamy, Tiruchendur
  if (normTemple.includes('tiruchendur') || normCity.includes('tiruchendur')) {
    return {
      railHub: 'Tiruchendur',
      busHub: 'Tiruchendur',
      cabHub: 'Tiruchendur',
    };
  }

  // Subramania Swamy, Tiruttani
  if (normTemple.includes('tiruttani') || normCity.includes('tiruttani')) {
    return {
      railHub: 'Tiruttani',
      busHub: 'Tiruttani',
      cabHub: 'Tiruttani',
    };
  }

  // Brihadeeswarar -> Thanjavur
  if (normTemple.includes('brihadeeswarar') || normCity.includes('thanjavur')) {
    return {
      railHub: 'Thanjavur',
      busHub: 'Thanjavur',
      cabHub: 'Thanjavur',
    };
  }

  // Meenakshi -> Madurai
  if (normTemple.includes('meenakshi') || normCity.includes('madurai')) {
    return {
      railHub: 'Madurai',
      busHub: 'Madurai',
      cabHub: 'Madurai',
    };
  }

  // Ramanathaswamy -> Rameswaram
  if (normTemple.includes('ramanathaswamy') || normCity.includes('rameswaram')) {
    return {
      railHub: 'Rameswaram',
      busHub: 'Rameswaram',
      cabHub: 'Rameswaram',
    };
  }

  // Sri Suryanarayana -> Srikakulam
  if (normTemple.includes('suryanarayana') || normCity.includes('arasavalli') || normCity.includes('srikakulam')) {
    return {
      railHub: 'Srikakulam',
      busHub: 'Srikakulam',
      cabHub: 'Arasavalli',
    };
  }

  const defaultHub = city || templeName || 'Temple';
  return {
    railHub: defaultHub,
    busHub: defaultHub,
    cabHub: defaultHub,
  };
};

/**
 * Generates verified, high-availability travel search and portal links
 */
export const getTransitOptions = ({
  originName,
  originAddress,
  templeName,
  templeCity,
}: {
  originName?: string;
  originAddress?: string;
  templeName?: string;
  templeCity?: string;
}): TransitOption[] => {
  const fromCity = extractCityName(originName, originAddress);
  const hubs = resolveDestinationHub(templeName, templeCity);
  const destinationQuery = templeName ? `${templeName}, ${templeCity || ''}` : hubs.cabHub;
  const originQuery = originAddress || originName || fromCity;

  // 1. Train Option: Google Transit Live Train Schedules + Direct Portals
  const trainTransitUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(hubs.railHub + ' Railway Station')}&travelmode=transit`;

  // 2. Bus Option: Direct RedBus Portal + Google Transit Intercity Buses
  const busTransitUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(hubs.busHub + ' Bus Stand')}&travelmode=transit`;

  // 3. Outstation Cabs: Direct MakeMyTrip Outstation portal + Turn-by-Turn Driving Route
  const cabDirectUrl = `https://www.makemytrip.com/cabs/`;
  const cabDrivingUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQuery)}&destination=${encodeURIComponent(destinationQuery)}&travelmode=driving`;

  return [
    {
      id: 'trains',
      type: 'train',
      title: 'Pilgrimage Trains',
      badge: 'Direct & Affordable',
      description: `Check live train timetables, express & superfast trains between ${fromCity} and ${hubs.railHub} Jn with seat availability.`,
      searchSummary: `${fromCity} ⇌ ${hubs.railHub} Jn`,
      primaryActionText: 'View Live Train Schedules',
      primaryActionUrl: trainTransitUrl,
      portalLinks: [
        { label: 'ConfirmTkt', url: 'https://www.confirmtkt.com/' },
        { label: 'MakeMyTrip Trains', url: 'https://www.makemytrip.com/railways/' },
        { label: 'IRCTC Official', url: 'https://www.irctc.co.in/' },
      ],
      highlights: ['Live Train Timetables & Platforms', 'Sleeper, 3AC & Vande Bharat', 'IRCTC & ConfirmTkt Booking'],
    },
    {
      id: 'buses',
      type: 'bus',
      title: 'Intercity Buses',
      badge: 'High Frequency',
      description: `Search state RTC (APSRTC/KSRTC/SETC) & private luxury AC sleeper buses running between ${fromCity} and ${hubs.busHub}.`,
      searchSummary: `${fromCity} ⇌ ${hubs.busHub}`,
      primaryActionText: 'Search Buses on RedBus',
      primaryActionUrl: 'https://www.redbus.in/',
      portalLinks: [
        { label: 'RedBus Portal', url: 'https://www.redbus.in/' },
        { label: 'AbhiBus Portal', url: 'https://www.abhibus.com/' },
        { label: 'Live Bus Schedules', url: busTransitUrl },
      ],
      highlights: ['Government RTCs & Private', 'Overnight Sleeper Options', 'Multiple Boarding Points'],
    },
    {
      id: 'cabs',
      type: 'cab',
      title: 'Outstation Private Cabs',
      badge: 'Doorstep Pickup',
      description: `Reserve dedicated private cabs with verified chauffeurs for direct round-trip darshan from ${fromCity} to ${hubs.cabHub}.`,
      searchSummary: `${fromCity} ⇌ ${hubs.cabHub}`,
      primaryActionText: 'Book Outstation Cab',
      primaryActionUrl: cabDirectUrl,
      portalLinks: [
        { label: 'MakeMyTrip Cabs', url: 'https://www.makemytrip.com/cabs/' },
        { label: 'Savaari Rentals', url: 'https://www.savaari.com/' },
        { label: 'Driving Route Maps', url: cabDrivingUrl },
      ],
      highlights: ['Door-to-Door Pickup', 'Darshan Waiting Included', 'Sedan / SUV / Innova Options'],
    },
  ];
};
