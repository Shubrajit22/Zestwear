'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  imageUrl: string;
  state: string | null;
  district: string | null;
  institution: string | null;
};

export default function UniformCategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [institution, setInstitution] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchUniforms = async () => {
      const res = await fetch('/api/products/uniform');
      const data = await res.json();
      setProducts(data);
    };
    fetchUniforms();
  }, []);

  useEffect(() => {
    const result = products.filter(
      (p) =>
        (!state || p.state === state) &&
        (!district || p.district === district) &&
        (!institution || p.institution === institution)
    );
    setFiltered(result);
    setCurrentIndex(0);
  }, [state, district, institution, products]);

  const uniqueStates = [...new Set(products.map((p) => p.state).filter(Boolean))];
  const uniqueDistricts = [...new Set(products.filter((p) => p.state === state).map((p) => p.district).filter(Boolean))];
  const uniqueInstitutions = [...new Set(products.filter((p) => p.district === district).map((p) => p.institution).filter(Boolean))];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen  text-white flex justify-center items-center px-4 py-10 mt-10">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-7xl">

        {/* Left Side: Filters */}
        <div className="flex flex-col justify-center items-center text-center w-full lg:w-2/3 space-y-6 lg:items-start lg:text-left">
          <div className='mb-20'>
            <h1 className="text-4xl font-bold mb-4">Find Your School Uniform</h1>
            <p className="text-gray-400 text-lg">Select your school to view its uniform</p>
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <div className="flex gap-4">
              {/* State and District in Same Line */}
              <select
                className="w-full p-3 rounded-lg bg-white text-black font-semibold text-lg"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict('');
                  setInstitution('');
                }}
              >
                <option value="">Select State</option>
                {uniqueStates.map((s) => (
                  <option key={s} value={s!}>{s}</option>
                ))}
              </select>

              <select
                className="w-full p-3 rounded-lg bg-white text-black font-semibold text-lg"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setInstitution('');
                }}
                disabled={!state}
              >
                <option value="">Select District</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d!}>{d}</option>
                ))}
              </select>
            </div>

            {/* School (Institution) on Bottom with Full Width */}
            <select
              className="w-full p-3 rounded-lg bg-white text-black font-semibold text-lg"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              disabled={!district}
            >
              <option value="">Select Institution</option>
              {uniqueInstitutions.map((i) => (
                <option key={i} value={i!}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Image Carousel */}
        <div className="w-full lg:w-1/3 flex flex-col items-center mt-6 lg:mt-0 lg:mr-8">
          {filtered.length > 0 ? (
            <>
              <Link href={`/product/${filtered[currentIndex].id}`} className="block w-full max-w-sm">
                <div className="bg-white text-black rounded-2xl overflow-hidden shadow-xl transition">
                  <Image
                    src={filtered[currentIndex].imageUrl}
                    alt={filtered[currentIndex].name}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-semibold">{filtered[currentIndex].name}</h3>
                  </div>
                </div>
              </Link>

              {/* Circle Navigation */}
              <div className="flex mt-4 gap-2 justify-center">
                {filtered.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-4 h-4 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-400'} transition-colors`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-400 mt-10 text-lg">No uniform found</div>
          )}
        </div>
      </div>
    </div>
  );
}
