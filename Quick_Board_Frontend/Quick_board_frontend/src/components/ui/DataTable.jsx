
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({ 
  columns, 
  data, 
  loading = false, 
  onEdit, 
  onDelete, 
  onApprove,
  actions = [] 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(row) : (
                    <span className="text-sm text-gray-900">
                      {row[column.key]}
                    </span>
                  )}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {actions.map((action, actionIndex) => {
                      if (action.condition && !action.condition(row)) {
                        return null;
                      }
                      return (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${action.className}`}
                        >
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;