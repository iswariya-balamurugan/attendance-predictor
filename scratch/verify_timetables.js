// Verification script for timetable analysis
const fs = require('fs');

const timetableData = {
  "II_BME": {
    section: "II - BME",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester III)",
    source_pdf: "II BME.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 602 / FN",
    slots: {
      "A": { code: "21MAB201T", name: "Transforms and Boundary Value Problems", credits: "3-1-0-4", faculty: "Dr.A.Manickam" },
      "B": { code: "21BMC202T", name: "Biomedical Signals and Systems", credits: "3-0-0-3", faculty: "Dr. Senthil Kumaran V N" },
      "C": { code: "21BMC203J", name: "Electric and Electronic Circuits", credits: "3-0-2-4", faculty: "Dr. Prabin Kumar Bera" },
      "D": { code: "21BMC204J", name: "Digital Logic for Medical Systems", credits: "2-0-2-3", faculty: "Dr. G. Gifta" },
      "E": { code: "21PYS202T", name: "Medical Physics", credits: "3-0-0-3", faculty: "Dr.D.Rajeswari" },
      "F": { code: "21LEM201T", name: "Professional Ethics", credits: "1-0-0-0", faculty: "Dr. H.SriBhuvaneshwari" },
      "G": { code: "21LEM202T", name: "Universal Human Values-II", credits: "2-1-0-3", faculty: "Mrs.N.Suganthi" },
      "H": { code: "21PDM201L", name: "Verbal Reasoning", credits: "0-0-2-0", faculty: "CDC-TB-106" },
      "I": { code: "21PDH201T", name: "Social Engineering", credits: "2-0-0-2", faculty: "Mrs. Francis Arockiya Mary" }
    },
    grid: {
      "Monday":    ["E", "C", "I", "I", "DLMS/EEC-107,309", "DLMS/EEC-107,309", "Empty", "Empty"],
      "Tuesday":   ["C", "E", "B", "A", "H-TB-106", "H-TB-106", "Empty", "Empty"],
      "Wednesday": ["B", "D", "A", "A", "H-TB-106", "G-602", "Empty", "Empty"],
      "Thursday":  ["A", "E", "B", "D", "Empty", "Empty", "DLMS/EEC-107,309", "DLMS/EEC-107,309"],
      "Friday":    ["F", "A", "C", "D", "Empty", "Empty", "Empty", "G-602"]
    }
  },
  "II_ECE_DS_A": {
    section: "II - ECE - DS A",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester III)",
    source_pdf: "II ECE DS A.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 416 / FN",
    slots: {
      "A": { code: "21MAB201T", name: "Transforms and Boundary Value Problems", credits: "3-1-0-4", faculty: "Dr.C. Arun Kumar" },
      "B": { code: "21ECC201T", name: "Solid State Devices", credits: "3-0-0-3", faculty: "Dr. Jeevanantham S" },
      "C": { code: "21CSS201T", name: "Computer Organization and Architecture", credits: "3-1-0-4", faculty: "Dr. P. Murugapandiyan" },
      "D": { code: "21ECC203T", name: "Digital Logic Design", credits: "3-0-0-3", faculty: "Dr.S.Krishnakumar" },
      "E": { code: "21ECC205T", name: "Electromagnetic Theory and Interference", credits: "3-0-0-3", faculty: "Dr.V. Bharathi" },
      "F": { code: "21LEM201T", name: "Professional Ethics", credits: "1-0-0-0", faculty: "Dr. Jothi M" },
      "G": { code: "21LEM202T", name: "Universal Human Values-II", credits: "2-1-0-3", faculty: "Mrs.N.Suganthi" },
      "H": { code: "21PDM201L", name: "Verbal Reasoning", credits: "0-0-2-0", faculty: "CDC - TB -106" },
      "I": { code: "21PDH209T", name: "Social Engineering", credits: "2-0-0-2", faculty: "Mrs.D. Lavanya" },
      "LAB": { code: "21ECC211L", name: "Devices and Digital IC Laboratory", credits: "0-0-4-2", faculty: "Dr. Jeevanantham S / Dr.V. Bharathi" }
    },
    grid: {
      "Monday":    ["E", "A", "I", "I", "G-602", "G-602", "LAB -309/107", "LAB -309/107"],
      "Tuesday":   ["C", "A", "E", "D", "G-602", "G-602", "H-TB -106", "H-TB -106"],
      "Wednesday": ["A", "B", "C", "D", "Empty", "H-TB - 106", "Empty", "Empty"],
      "Thursday":  ["B", "C", "A", "F", "LAB -309/107", "LAB -309/107", "Empty", "Empty"],
      "Friday":    ["D", "B", "E", "C", "Empty", "Empty", "Empty", "Empty"]
    }
  },
  "II_ECE_DS_B": {
    section: "II - ECE - DS B",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester III)",
    source_pdf: "II ECE DS B.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 411 / AN",
    slots: {
      "A": { code: "21MAB201T", name: "Transforms and Boundary Value Problems", credits: "3-1-0-4", faculty: "NEW FACULTY 3" },
      "B": { code: "21ECC201T", name: "Solid State Devices", credits: "3-0-0-3", faculty: "Dr. Jeevanantham S" },
      "C": { code: "21CSS201T", name: "Computer Organization and Architecture", credits: "3-1-0-4", faculty: "Dr. P. Murugapandiyan" },
      "D": { code: "21ECC203T", name: "Digital Logic Design", credits: "3-0-0-3", faculty: "Dr.S.Krishnakumar" },
      "E": { code: "21ECC205T", name: "Electromagnetic Theory and Interference", credits: "3-0-0-3", faculty: "Dr.V. Bharathi" },
      "F": { code: "21LEM201T", name: "Professional Ethics", credits: "1-0-0-0", faculty: "Dr. K. Vigneshwaran" },
      "G": { code: "21LEM202T", name: "Universal Human Values-II", credits: "2-1-0-3", faculty: "Mrs.D.Lavanya" },
      "H": { code: "21PDM201L", name: "Verbal Reasoning", credits: "0-0-2-0", faculty: "CDC-TB-106" },
      "I": { code: "21PDH209T", name: "Social Engineering", credits: "2-0-0-2", faculty: "Mrs.D. Lavanya" },
      "LAB": { code: "21ECC211L", name: "Devices and Digital IC Laboratory", credits: "0-0-4-2", faculty: "Dr.S.Krishnakumar" }
    },
    grid: {
      "Monday":    ["Empty", "Empty", "LAB -309/107", "LAB -309/107", "D", "B", "C", "I"],
      "Tuesday":   ["LAB -309/107", "LAB -309/107", "Empty", "Empty", "C", "D", "E", "A"],
      "Wednesday": ["G - 401", "G - 401", "Empty", "Empty", "I", "E", "A", "D"],
      "Thursday":  ["G-401", "G-401", "H-TB-106", "H-TB-106", "A", "C", "B", "E"],
      "Friday":    ["H - TB- 106", "H - TB- 106", "Empty", "Empty", "F", "A", "B", "C"]
    }
  },
  "III_BME": {
    section: "III - BME",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester V)",
    source_pdf: "III BME.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 211 / AN",
    slots: {
      "A": { code: "21MAB301T", name: "Probability and Statistics", credits: "3-1-0-4", faculty: "Dr. K. M. Karuppusamy" },
      "B": { code: "21BMC302J", name: "Microcontrollers and Its Application in Medicine", credits: "3-0-2-4", faculty: "Dr.K.Vigneshwaran" },
      "C": { code: "21BMC301J", name: "Biomedical Signal Processing", credits: "3-0-2-4", faculty: "Dr. V.N. Senthilkumaran" },
      "D": { code: "21BME266T", name: "Biometrics", credits: "3-0-0-3", faculty: "Dr. G. Gifta" },
      "E": { code: "21ECO103T", name: "Modern wireless communication system", credits: "3-0-0-3", faculty: "Dr. Vaishnavi" },
      "F": { code: "21BMC303T", name: "Principles of Medical Imaging", credits: "3-0-0-3", faculty: "Dr.N.Prasana venkatesh" },
      "G": { code: "21PDM301L", name: "Analytical and Logical Thinking Skills", credits: "0-0-2-0", faculty: "CDC-625" },
      "H": { code: "21LEM301T", name: "Indian Art Form", credits: "1-0-0-0", faculty: "Dr. G. Gifta" },
      "I": { code: "21GNP301L", name: "Community Connect", credits: "0-0-2-1", faculty: "Dr. J.Jencia / Dr.N.Prasanna Venkatesh" }
    },
    grid: {
      "Monday":    ["G-625", "G-625", "MPMC LAB-107", "MPMC LAB-107", "E", "B", "F", "H"],
      "Tuesday":   ["BIO DSP LAB-108", "BIO DSP LAB-108", "G-625", "G-625", "C", "D", "A", "B"],
      "Wednesday": ["Empty", "Empty", "Empty", "Empty", "C", "A", "F", "D"],
      "Thursday":  ["Empty", "Empty", "Empty", "I-108", "A", "C", "E", "B"],
      "Friday":    ["I-108", "I-108", "Empty", "Empty", "F", "A", "D", "E"]
    }
  },
  "III_ECE_A": {
    section: "III ECE-A",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester V)",
    source_pdf: "III ECE A.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 518/FN",
    slots: {
      "A": { code: "21MAB302T", name: "Discrete Mathematics", credits: "3-1-0-4", faculty: "New Faculty 3" },
      "B": { code: "21ECC301P", name: "Microprocessor, Microcontroller, and Interfacing Techniques", credits: "3-1-0-4", faculty: "Dr.M.Manikandan" },
      "C": { code: "21ECC303T", name: "VLSI Design and Technology", credits: "3-0-0-3", faculty: "Dr.M.Jothi" },
      "D": { code: "21ECE468T", name: "System and Network on Chip", credits: "3-0-0-3", faculty: "Dr.V. Manikandan" },
      "E": { code: "21CSO355T", name: "Machine learning for all", credits: "3-0-0-3", faculty: "Dr. J.Jencia" },
      "F": { code: "21GNP301L", name: "Community connect", credits: "0-0-2-1", faculty: "Dr.V .Rajesh / Dr. V.Bharathi" },
      "G": { code: "21PDM301L", name: "Analytical and logical thinking skills", credits: "0-0-2-0", faculty: "CDC / 625" },
      "H": { code: "21LEM301T", name: "Indian Art Form", credits: "1-0-0-0", faculty: "Dr.K.Vigneshwaran" },
      "LAB": { code: "21ECC311L", name: "VLSI Design/ Microprocessor Laboratory", credits: "0-0-4-2", faculty: "Dr.M.Jothi & Dr. P. Murugapandiyan / Dr.V. Manikandan" }
    },
    grid: {
      "Monday":    ["E", "B", "B", "A", "G - 625", "G - 625", "Empty", "Empty"],
      "Tuesday":   ["H", "D", "B", "B-Proj", "Empty", "G-625", "Empty", "Empty"],
      "Wednesday": ["C", "A", "D", "F", "Empty", "Empty", "LAB-108/309", "LAB-108/309"],
      "Thursday":  ["A", "E", "C", "F", "Empty", "Empty", "Empty", "Empty"],
      "Friday":    ["D", "A", "E", "C", "LAB-108/309", "LAB-108/309", "Empty", "Empty"]
    }
  },
  "III_ECE_B": {
    section: "III ECE-B",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester V)",
    source_pdf: "III ECE B.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 518/AN",
    slots: {
      "A": { code: "21MAB302T", name: "Discrete Mathematics", credits: "3-1-0-4", faculty: "Dr.M.Thanga Rejini" },
      "B": { code: "21ECC301P", name: "Microprocessor, Microcontroller, and Interfacing Techniques", credits: "3-1-0-4", faculty: "Mrs. B. Abirami" },
      "C": { code: "21ECC303T", name: "VLSI Design and Technology", credits: "3-0-0-3", faculty: "Dr.R.Vinoth Raj" },
      "D": { code: "21ECE468T", name: "System and Network on Chip", credits: "3-0-0-3", faculty: "Dr.V. Manikandan" },
      "E": { code: "21CSO355T", name: "Machine learning for all", credits: "3-0-0-3", faculty: "Dr. J.Jencia" },
      "F": { code: "21GNP301L", name: "Community connect", credits: "0-0-2-1", faculty: "Dr. H. Sudharsan / Ms. T.Swetha" },
      "G": { code: "21PDM301L", name: "Analytical and logical thinking skills", credits: "0-0-2-0", faculty: "CDC - 625" },
      "H": { code: "21LEM301T", name: "Indian Art Form", credits: "1-0-0-0", faculty: "Dr. A.Anand" },
      "LAB": { code: "21ECC311L", name: "VLSI Design/ Microprocessor Laboratory", credits: "0-0-4-2", faculty: "Dr.Sreenivasa Ijada Rao / Dr. B. DeviSri & Dr. Prasanna Venkatesh" }
    },
    grid: {
      "Monday":    ["LAB-108/309", "LAB-108/309", "Empty", "Empty", "E", "B", "A", "D"],
      "Tuesday":   ["G-625", "G-625", "Empty", "Empty", "F", "B", "D", "C"],
      "Wednesday": ["G-625", "G-625", "Empty", "Empty", "B-Proj", "B", "A", "H"],
      "Thursday":  ["LAB-108/309", "LAB-108/309", "Empty", "Empty", "A", "C", "E", "F"],
      "Friday":    ["Empty", "Empty", "Empty", "Empty", "C", "A", "E", "D"]
    }
  },
  "III_ECE_DS": {
    section: "III ECE-DS",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester V)",
    source_pdf: "III ECE DS.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 519/FN",
    slots: {
      "A": { code: "21MAB302T", name: "Discrete Mathematics", credits: "3-1-0-4", faculty: "New faculty 2" },
      "B": { code: "21ECC301P", name: "Microprocessor, Microcontroller, and Interfacing Techniques", credits: "3-1-0-4", faculty: "Mrs. B. Abirami" },
      "C": { code: "21ECC303T", name: "VLSI Design and Technology", credits: "3-0-0-3", faculty: "Dr.R.Vinoth Raj" },
      "D": { code: "21CSO355T", name: "Machine learning for all", credits: "3-0-0-3", faculty: "Dr. Dr.Chitra Devi" },
      "E": { code: "21ECE371T", name: "Database Design and Management", credits: "3-0-0-3", faculty: "Dr. S.Saraswathi" },
      "F": { code: "21GNP301L", name: "Community connect", credits: "0-0-2-1", faculty: "Dr. S.Jeevanantham / Dr.V. Manikandan" },
      "G": { code: "21PDM301L", name: "Analytical and logical thinking skills", credits: "0-0-2-0", faculty: "CDC-625" },
      "H": { code: "21LEM301T", name: "Indian Art Form", credits: "1-0-0-0", faculty: "Dr.Prabin Kumar Bera" },
      "LAB": { code: "21ECC311L", name: "VLSI Design/ Microprocessor Laboratory", credits: "0-0-4-2", faculty: "Dr. R. Vinothraj / Dr. H. Sri Bhuvaneshwari" }
    },
    grid: {
      "Monday":    ["E", "B", "C", "A", "Empty", "Empty", "Empty", "Empty"],
      "Tuesday":   ["C", "B", "D", "F", "LAB-108/107", "LAB-108/107", "Empty", "Empty"],
      "Wednesday": ["H", "B", "A", "C", "Empty", "Empty", "G-625", "G-625"],
      "Thursday":  ["A", "D", "E", "F", "Empty", "Empty", "Empty", "Empty"],
      "Friday":    ["D", "A", "E", "B-Proj", "G-625", "G-625", "LAB-108/107", "LAB-108/107"]
    }
  },
  "IV_ECE_A": {
    section: "IV ECE-A",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester VII)",
    source_pdf: "IV ECE A.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 225",
    slots: {
      "A": { code: "21GNH401T", name: "Behavioural Psychology", credits: "2-1-0-3", faculty: "Dr.A.Anand" },
      "B": { code: "21ECC401T", name: "Wireless Communication and Antenna Systems", credits: "3-0-0-3", faculty: "Dr.K.Vigneshwaran," },
      "C": { code: "21ECC402P", name: "Computer Communication and Network Security", credits: "2-1-0-3", faculty: "Dr.S.Jeevanantham" },
      "D": { code: "21ECE461T", name: "Semiconductor Memory Design", credits: "3-0-0-3", faculty: "Dr. H.SriBhuvaneshwari" },
      "E": { code: "21ECE463T", name: "Scripting Language for Electronic Design Automation", credits: "3-0-0-3", faculty: "Dr. Sreenivasa Rao Ijada," },
      "F": { code: "21CSO355T", name: "Machine learning for all", credits: "3-0-0-3", faculty: "Dr.N.Prasanna Venkatesh" },
      "LAB": { code: "21ECC402P", name: "Computer Communication and Network Security Laboratory", credits: "2-1-0-3", faculty: "Mrs.T.Swetha" }
    },
    grid: {
      "Monday":    ["C", "Empty", "A", "D", "Empty", "Empty", "Empty", "Empty"],
      "Tuesday":   ["C", "D", "B", "F", "Empty", "Empty", "Empty", "Empty"],
      "Wednesday": ["B", "LAB - IST 108", "E", "F", "Empty", "Empty", "Empty", "Empty"],
      "Thursday":  ["F", "A", "E", "B", "Empty", "Empty", "Empty", "Empty"],
      "Friday":    ["C", "A", "D", "E", "Empty", "Empty", "Empty", "Empty"]
    }
  },
  "IV_ECE_B": {
    section: "IV ECE-B",
    academic_year: "2026-2027",
    semester: "Odd Semester (Semester VII)",
    source_pdf: "IV ECE B.pdf",
    page: 1,
    is_2026_27: true,
    venue: "IST 227",
    slots: {
      "A": { code: "21GNH401T", name: "Behavioural Psychology", credits: "2-1-0-3", faculty: "Dr.A.Annand" },
      "B": { code: "21ECC401T", name: "Wireless Communication and Antenna Systems", credits: "3-0-0-3", faculty: "Dr.K.Vigneshwaran," },
      "C": { code: "21ECC402P", name: "Computer Communication and Network Security", credits: "2-1-0-3", faculty: "Dr. R. Rajasekar" },
      "D": { code: "21ECE461T", name: "Semiconductor Memory Design", credits: "3-0-0-3", faculty: "Dr. H.SriBhuvaneshwari" },
      "E": { code: "21ECE463T", name: "Scripting Language for Electronic Design Automation", credits: "3-0-0-3", faculty: "Dr. Sreenivasa Rao Ijada" },
      "F": { code: "21CSO355T", name: "Machine learning for all", credits: "3-0-0-3", faculty: "Dr.N.Prasanna Venkatesh" },
      "LAB": { code: "21ECC402P", name: "Computer Communication and Network Security Laboratory", credits: "2-1-0-3", faculty: "Ms.T.Swetha" }
    },
    grid: {
      "Monday":    ["C", "A", "E", "F", "Empty", "Empty", "Empty", "Empty"],
      "Tuesday":   ["C", "E", "F", "B", "Empty", "Empty", "Empty", "Empty"],
      "Wednesday": ["C", "D", "A", "B", "Empty", "Empty", "Empty", "Empty"],
      "Thursday":  ["D", "B", "LAB - IST 108", "A", "Empty", "Empty", "Empty", "Empty"],
      "Friday":    ["E", "D", "F", "Empty", "Empty", "Empty", "Empty", "Empty"]
    }
  }
};

console.log("Validating timetable grids and period counts...");
for (const [key, data] of Object.entries(timetableData)) {
  console.log(`\n=== Section: ${data.section} (${data.source_pdf}) ===`);
  const counts = {};
  for (const [day, periods] of Object.entries(data.grid)) {
    periods.forEach(p => {
      counts[p] = (counts[p] || 0) + 1;
    });
  }
  console.log("Period counts by cell label:", counts);
}
