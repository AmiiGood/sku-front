import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = "Buscar..." }) => {
    return (
        <div className="search-container">
            <div className="search-input">
                <Search className="search-icon" size={16} />
                <input
                    type="text"
                    className="form-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default SearchInput;