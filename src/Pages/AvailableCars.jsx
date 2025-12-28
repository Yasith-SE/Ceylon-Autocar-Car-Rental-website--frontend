
import Navbar from '../components/Navbar';
import Card from '../components/Card';

const AvailableCars = () => {


  const cars = [
    {
      id: 1,
      name: "Toyota Prius",
      year: "2023",
      price: 45,
      image: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "BMW 5 Series",
      year: "2022",
      price: 85,
      image: "https://www.bmw.lk/content/dam/bmw/common/all-models/5-series/sedan/2021/Highlights/bmw-5-series-sedan-sp-desktop.jpg/jcr:content/renditions/cq5dam.resized.img.1680.large.time1629365534507.jpg"
    },
    {
      id: 3,
      name: "Tesla Model 3",
      year: "2024",
      price: 70,
      image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Mercedes C-Class",
      year: "2021",
      price: 90,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "Audi A4",
      year: "2020",
      price: 65,
      image: "https://www.netcarshow.com/Audi-A4-2020-1280-f3fa6083598e30ccadac12dbf020ebb84d.jpg?token=d2b651ba311a44f59cc64c733a7f1578ff7276c2fc82e00ddc5e020"
    },
    {
      id: 6,
      name: "Ford Mustang",
      year: "2021",
      price: 110,
      image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <Navbar />

      <div className="container" style={{ marginTop: '100px' }}>
        <h2 className="mb-4 fw-bold">Available Cars</h2>


        <div className="row">
          {cars.map((car) => (
            <Card
              key={car.id}
              image={car.image}
              name={car.name}
              price={car.price}
              year={car.year}
            />
          ))}
        </div>

      </div>
    </>
  );
};

export default AvailableCars;