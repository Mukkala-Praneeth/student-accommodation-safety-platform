// List of verified Indian B.Tech college domains
const verifiedCollegeDomains = {
  // IITs
  'iitd.ac.in': 'IIT Delhi',
  'iitb.ac.in': 'IIT Bombay',
  'iitm.ac.in': 'IIT Madras',
  'iitkgp.ac.in': 'IIT Kharagpur',
  'iitk.ac.in': 'IIT Kanpur',
  'iitg.ac.in': 'IIT Guwahati',
  'iith.ac.in': 'IIT Hyderabad',
  'iitr.ac.in': 'IIT Roorkee',
  'iitbbs.ac.in': 'IIT Bhubaneswar',
  'iiti.ac.in': 'IIT Indore',
  'iitp.ac.in': 'IIT Patna',
  'iitj.ac.in': 'IIT Jodhpur',
  'iitgn.ac.in': 'IIT Gandhinagar',
  'iitmandi.ac.in': 'IIT Mandi',
  
  // NITs
  'nitw.ac.in': 'NIT Warangal',
  'nitt.edu': 'NIT Trichy',
  'nitk.ac.in': 'NIT Karnataka',
  'mnnit.ac.in': 'MNNIT Allahabad',
  'vnit.ac.in': 'VNIT Nagpur',
  'nitc.ac.in': 'NIT Calicut',
  'manit.ac.in': 'MANIT Bhopal',
  'svnit.ac.in': 'SVNIT Surat',
  'mnit.ac.in': 'MNIT Jaipur',
  'nits.ac.in': 'NIT Silchar',
  
  // IIITs
  'iiitd.ac.in': 'IIIT Delhi',
  'iiith.ac.in': 'IIIT Hyderabad',
  'iiitb.ac.in': 'IIIT Bangalore',
  'iiita.ac.in': 'IIIT Allahabad',
  
  // Top Private Colleges
  'bits-pilani.ac.in': 'BITS Pilani',
  'vit.ac.in': 'VIT Vellore',
  'manipal.edu': 'Manipal Institute of Technology',
  'thapar.edu': 'Thapar University',
  'dtu.ac.in': 'Delhi Technological University',
  'nsut.ac.in': 'NSUT Delhi',
  'pes.edu': 'PES University',
  'msrit.edu': 'MSRIT Bangalore',
  'bmsce.ac.in': 'BMS College of Engineering',
  'rvce.edu.in': 'RV College of Engineering',
  'sjce.ac.in': 'SJCE Mysore',
  
  // Hyderabad Colleges
  'vce.ac.in': 'Vasavi College of Engineering',  // ✅ YOUR COLLEGE
  'cbit.ac.in': 'CBIT Hyderabad',
  'cvr.ac.in': 'CVR College of Engineering',
  'mgit.ac.in': 'MGIT Hyderabad',
  'griet.ac.in': 'GRIET Hyderabad',
  'cmrcet.ac.in': 'CMRCET Hyderabad',
  'vardhaman.org': 'Vardhaman College of Engineering',
  'snist.ac.in': 'Sreenidhi Institute of Science and Technology',
  'mjcollege.ac.in': 'MJ College of Engineering',
  
  // Bangalore Colleges
  'rvce.edu.in': 'RV College of Engineering',
  'bmsce.ac.in': 'BMS College of Engineering',
  'bmsit.ac.in': 'BMS Institute of Technology',
  'nie.ac.in': 'NIE Mysore',
  
  // Chennai/Tamil Nadu
  'annauniv.edu': 'Anna University',
  'ssn.edu.in': 'SSN College of Engineering',
  'psgtech.edu': 'PSG College of Technology',
  'tce.edu': 'Thiagarajar College of Engineering',
  
  // Mumbai/Pune
  'coep.ac.in': 'COEP Pune',
  'vjti.ac.in': 'VJTI Mumbai',
  'pict.edu': 'PICT Pune',
  'mitindia.edu': 'MIT Pune',
  
  // Delhi NCR
  'dce.edu': 'Delhi College of Engineering',
  'jiit.ac.in': 'JIIT Noida',
  'galgotiasuniversity.edu.in': 'Galgotias University',
  
  // West Bengal
  'jaduniv.edu.in': 'Jadavpur University',
  'iiests.ac.in': 'IIEST Shibpur',
  
  // Add more colleges as needed...
};

// Common education domain patterns (fallback)
const educationPatterns = [
  '.ac.in',      // Most Indian colleges
  '.edu.in',     // Educational institutions
  '.edu',        // International universities
  '.ernet.in',   // Education network
  '.res.in',     // Research institutions
];

/**
 * Check if email is from a verified college
 * @param {string} email - User's email address
 * @returns {object} - { isVerified: boolean, collegeName: string|null }
 */
function checkCollegeEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isVerified: false, collegeName: null };
  }

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];

  if (!domain) {
    return { isVerified: false, collegeName: null };
  }

  // 1. Check exact domain match (specific colleges)
  if (verifiedCollegeDomains[domain]) {
    return {
      isVerified: true,
      collegeName: verifiedCollegeDomains[domain]
    };
  }

  // 2. Check for common education patterns
  for (const pattern of educationPatterns) {
    if (domain.endsWith(pattern)) {
      // Extract college name from domain (best effort)
      const collegeName = domain
        .replace(pattern, '')
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        isVerified: true,
        collegeName: collegeName || 'Educational Institution'
      };
    }
  }

  // 3. Not a college email
  return { isVerified: false, collegeName: null };
}

module.exports = {
  checkCollegeEmail,
  verifiedCollegeDomains
};