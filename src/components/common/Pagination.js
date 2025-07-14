import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  // Función para generar el rango de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Número máximo de páginas visibles

    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas con puntos suspensivos
      if (currentPage <= 4) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Cerca del final
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calcular rango de elementos mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  return (
    <div className="pagination-container">
      {/* Información de elementos */}
      {totalItems && (
        <div className="pagination-info">
          Mostrando {startItem} - {endItem} de {totalItems} elementos
        </div>
      )}

      {/* Controles de paginación */}
      <div className="pagination">
        {/* Ir a primera página */}
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Página anterior */}
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Números de página */}
        <div className="pagination-numbers">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                key={page}
                className={`btn pagination-number ${
                  page === currentPage ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Página siguiente */}
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>

        {/* Ir a última página */}
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>

        {/* Input para ir a página específica */}
        <div className="pagination-goto">
          <span>Ir a:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder={currentPage}
            className="pagination-input"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                  e.target.value = "";
                }
              }
            }}
            onBlur={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
