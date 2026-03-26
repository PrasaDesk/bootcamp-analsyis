import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

/**
 * Custom hook that fetches and parses the Excel file on every mount (page refresh).
 * This ensures the latest data from data_file.xlsx is always used.
 * 
 * Individual student sheets structure:
 * Row 0: [Name, Track, "Week 1"..."Week 8", "ToDo Project", "Overall point", "Mid Term MOM", "Final MOM"]
 * Rows 1+: [Category, MentorName, W1Score, W2Score, ..., W8Score, TodoScore]
 *   Categories: Communication, Professionalism and Discipline, Proactiveness, Learning and Agile, React, Node/Java
 *   Each category has multiple mentor rows (Sahil, Vimu, Rahul, Devashree, etc.)
 */
export default function useBootcampData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function loadData() {
      try {
        setLoading(true);
        const storedData = localStorage.getItem('bootcamp_data');
        const storedKey = localStorage.getItem('google_api_key');
        
        if (!storedData || !storedKey) {
          setError('missing_config');
          setLoading(false);
          return;
        }

        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        setError(null);
      } catch (err) {
        console.error('Failed to load bootcamp data from storage:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // React cleanly to updates crossing in from Settings
    window.addEventListener('storage', loadData);
    window.addEventListener('bootcamp_config_updated', loadData);

    loadData();

    // Background Auto-Refresh Tracker
    let intervalId;
    const isUrlSource = localStorage.getItem('bootcamp_data_source') === 'url';
    const intervalVal = parseInt(localStorage.getItem('bootcamp_refresh_interval') || '0', 10);
    
    if (isUrlSource && intervalVal && intervalVal > 0) {
      intervalId = setInterval(async () => {
        const url = localStorage.getItem('bootcamp_sheet_url');
        if (!url) return;
        
        try {
          console.log(`Executing background sync. Interval set to ${intervalVal}s...`);
          const { parseExcelFromUrl } = await import('../utils/excelParser');
          // fetch silently without prompting explicit file download
          const parsedData = await parseExcelFromUrl(url, false);
          localStorage.setItem('bootcamp_data', JSON.stringify(parsedData));
          setData(parsedData);
        } catch (err) {
          console.error("Background sync failed:", err);
        }
      }, intervalVal * 1000); // Seconds to Ms
    }

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('bootcamp_config_updated', loadData);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { data, loading, error };
}

