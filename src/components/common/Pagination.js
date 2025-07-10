import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination">
            <button
                className="btn btn-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft size={16} />
                Anterior
            </button>

            <span className="pagination-info">
                Página {currentPage} de {totalPages}
            </span>

            <button
                className="btn btn-secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Siguiente
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;