import Table from '../../components/table'

export default function Home() {
  return (
    <section className="flex flex-col md:py-10">
      <div className="h-screen">
        <div className="grid grid-cols-5 gap-4">
          
          {/* <!-- Title --> */}
          <div className="col-span-full mb-3">
            <p className="text-xl text-gray-800"> Bienvenido User!  </p>
          </div>

          {/* <!-- Card 1 --> */}
          <div className="col-span-1">
            <a href="">
              <img src="https://picsum.photos/seed/1/2000/1000" className="rounded-xl brightness-75" />
            </a>
            <p className="text-xs -translate-y-6 text-white font-semibold sm:-translate-y-8 sm:text-base translate-x-3"> Agregar Nuevo Cliente </p>
          </div>

          {/* <!-- Card 2 --> */}
          <div className="col-span-1">
            <a href="">
              <img src="https://picsum.photos/seed/2/2000/1000" className="rounded-xl brightness-75" />
            </a>
            <p className="text-xs -translate-y-6 text-white font-semibold sm:-translate-y-8 sm:text-base translate-x-3"> Realizar Presupuesto </p>
          </div>

          {/* <!-- Card 3 --> */}
          <div className="col-span-1">
            <a href="">
              <img src="https://picsum.photos/seed/3/2000/1000" className="rounded-xl brightness-75" />
            </a>
            <p className="text-xs -translate-y-6 text-white font-semibold sm:-translate-y-8 sm:text-base translate-x-3"> Actualizar Precios </p>
          </div>

          {/* <!-- Card 4 --> */}
          <div className="col-span-1">
            <a href="">
              <img src="https://picsum.photos/seed/4/2000/1000" className="rounded-xl brightness-75" />
            </a>
            <p className="text-xs -translate-y-6 text-white font-semibold sm:-translate-y-8 sm:text-base translate-x-3"> Controlar Stock </p>
          </div>

          {/* <!-- Card 5 --> */}
          <div className="col-span-1">
            <a href="">
              <img src="https://picsum.photos/seed/5/2000/1000" className="rounded-xl brightness-75" />
            </a>
            <p className="text-xs -translate-y-6 text-white font-semibold sm:-translate-y-8 sm:text-base translate-x-3"> Revisar Pedidos </p>
          </div>
        </div>
      </div>
      <Table/>
    </section>
  );
}
