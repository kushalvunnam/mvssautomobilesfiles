import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { ShieldCheck, History, AlertTriangle } from 'lucide-react';

export default function AuditLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/auditlogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400 font-semibold">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in p-1 select-none text-xs font-semibold">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" /> Security Audit Logs
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Immutable log of database mutations and role log-ins
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {logs.length > 0 ? (
                logs.map(log => {
                  let actionColor = 'bg-slate-50 text-slate-650';
                  if (log.action.includes('CREATE')) actionColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
                  if (log.action.includes('DELETE') || log.action.includes('REJECT')) actionColor = 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
                  if (log.action.includes('LOGIN')) actionColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="p-4 font-mono font-medium text-slate-400">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{log.userName}</td>
                      <td className="p-4 uppercase text-[9px] font-bold text-indigo-600 dark:text-indigo-400">{log.userRole}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-350 font-medium">{log.details}</td>
                      <td className="p-4 font-mono text-slate-400">{log.ipAddress || '::1'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No security audits logs registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
