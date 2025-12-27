const CarCard = ({ image, name, price, year }) => {
    return (
        <div className="col-12 col-md-4 mb-4">

            <div className="card h-100 shadow-sm border-0">

                <img src={image} className="card-img-top" alt={name} style={{ height: '200px', objectFit: 'cover' }} />
                
                <div className="card-body">

                    <h5 className="card-title fw-bold">{name}</h5>
                    <p className="text-muted mb-1">{year} Model</p>
                    <h6 className="text-success fw-bold">${price} / day</h6>
                    <button className="btn btn-outline-dark w-100 mt-3 rounded-pill">
                        Rent Now
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CarCard;