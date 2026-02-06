import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Accommodation, Report } from '../App';

interface AccommodationContextType {
  accommodations: Accommodation[];
  addReport: (accommodationId: string, report: Omit<Report, 'id' | 'userId' | 'userName' | 'timestamp'>) => void;
  updateAccommodationStatus: (accommodationId: string, status: 'under_review' | 'resolved') => void;
  addCounterEvidence: (accommodationId: string, evidence: string) => void;
}

const AccommodationContext = createContext<AccommodationContextType | undefined>(undefined);

export const AccommodationProvider: React.FC<{ 
  children: ReactNode; 
  initialAccommodations: Accommodation[] 
}> = ({ children, initialAccommodations }) => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(initialAccommodations);

  const addReport = (accommodationId: string, reportData: Omit<Report, 'id' | 'userId' | 'userName' | 'timestamp'>) => {
    const accommodation = accommodations.find(acc => acc.id === accommodationId);
    if (!accommodation) return;

    const newReport: Report = {
      id: `r${Date.now()}`,
      userId: 'current-user-id', // This would come from auth context in real app
      userName: 'Verified Resident',
      ...reportData,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    const updatedAccommodations = accommodations.map(acc => {
      if (acc.id === accommodationId) {
        const updatedReports = [...acc.reports, newReport];
        // Calculate risk score based on reports
        let riskScore = 0;
        updatedReports.forEach(report => {
          switch (report.category) {
            case 'Security':
              riskScore += 25;
              break;
            case 'Infrastructure':
              riskScore += 20;
              break;
            case 'Food':
            case 'Water':
              riskScore += 15;
              break;
            case 'Hygiene':
              riskScore += 10;
              break;
          }
        });
        
        let safetyClassification: 'Safe' | 'Risky' | 'High Risk' = 'Safe';
        if (riskScore >= 70) {
          safetyClassification = 'High Risk';
        } else if (riskScore >= 40) {
          safetyClassification = 'Risky';
        }

        return {
          ...acc,
          reports: updatedReports,
          riskScore,
          safetyClassification
        };
      }
      return acc;
    });

    setAccommodations(updatedAccommodations);
  };

  const updateAccommodationStatus = (accommodationId: string, status: 'under_review' | 'resolved') => {
    const updatedAccommodations = accommodations.map(acc => {
      if (acc.id === accommodationId) {
        const updatedReports = acc.reports.map(report => ({
          ...report,
          status: status === 'under_review' ? 'under_review' : report.status
        }));
        return {
          ...acc,
          reports: updatedReports
        };
      }
      return acc;
    });
    setAccommodations(updatedAccommodations);
  };

  const addCounterEvidence = (accommodationId: string, evidence: string) => {
    const updatedAccommodations = accommodations.map(acc => {
      if (acc.id === accommodationId) {
        return {
          ...acc,
          counterEvidence: evidence
        };
      }
      return acc;
    });
    setAccommodations(updatedAccommodations);
  };

  return (
    <AccommodationContext.Provider 
      value={{ 
        accommodations, 
        addReport, 
        updateAccommodationStatus, 
        addCounterEvidence 
      }}
    >
      {children}
    </AccommodationContext.Provider>
  );
};

export const useAccommodation = (): AccommodationContextType => {
  const context = useContext(AccommodationContext);
  if (context === undefined) {
    throw new Error('useAccommodation must be used within an AccommodationProvider');
  }
  return context;
};