const Slides = () => {
    return (
        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">


            <div className="carousel-indicators">
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="3"></button>
            </div>


            <div className="carousel-inner">
                <div className="carousel-item active">
                    <img
                        src="https://images.unsplash.com/photo-1542228262-3d663b306a53?q=80&w=2071&auto=format&fit=crop"
                        className="d-block w-100"
                        alt="Garage"
                        style={{ height: '100vh', objectFit: 'cover' }}
                    />
                </div>
                <div className="carousel-item">
                    <img
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"
                        className="d-block w-100"
                        alt="Woman driving"
                        style={{ height: '100vh', objectFit: 'cover' }}
                    />
                </div>
                <div className="carousel-item">
                    <img
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
                        className="d-block w-100"
                        alt="Blue Car"
                        style={{ height: '100vh', objectFit: 'cover' }}
                    />
                </div>
                <div className="carousel-item">
                    <img
                        src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop"
                        className="d-block w-100"
                        alt="Car Meet"
                        style={{ height: '100vh', objectFit: 'cover' }}
                    />
                </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>

        </div>
    );

}
export default Slides