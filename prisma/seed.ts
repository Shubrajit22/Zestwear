import { PrismaClient, ProductCategoryEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: ProductCategoryEnum.BRAHMAND,
      imageUrl: '/images/brahmand.jpeg',
      description: 'A special category for Brahmand products like T-shirts and Hoodies.',
    },
    {
      name: ProductCategoryEnum.NIRVAY,
      imageUrl: '/images/nirbhay.jpeg',
      description: 'Nirvay series, crafted for bold and fearless individuals.',
    },
    {
      name: ProductCategoryEnum.UNIFORM,
      imageUrl: '/images/uniform.jpeg',
      description: 'Uniforms for various institutions and organizations.',
    },
    {
      name: ProductCategoryEnum.JERSEY,
      imageUrl: '/images/jersey.jpg',
      description: 'Jersey collection for all sports lovers.',
    },
    {
      name: ProductCategoryEnum.SHOES,
      imageUrl: '/images/shoes.jpeg',
      description: 'Category for shoes, ranging from casual to formal.',
    },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {
        imageUrl: cat.imageUrl,
        description: cat.description,
      },
      create: cat,
    });
  }

  console.log('✅ Categories seeded: BRAHMAND → NIRVAY → UNIFORM → JERSEY → SHOES');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
