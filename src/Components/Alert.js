import React from 'react';

function Alert(props) {
    const capitalize = (word) => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto', height: '50px' }}>
            {props.alert && (
                <div className={`alert alert-${props.alert.type} alert-dismissible fade show text-center`} role="alert">
                    <strong>{capitalize(props.alert.type)}</strong>: {props.alert.msg}
                </div>
            )}
        </div>
    );
}

export default Alert;
