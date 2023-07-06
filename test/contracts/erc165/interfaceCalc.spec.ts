import { expect } from 'chai';
import {
  ACCESS_CONTROL_INTERFACE_ID,
  Erc165InterfaceId,
  ERC5484_INTERFACE_ID,
  ERC721_ENUMERABLE_INTERFACE_ID,
  ERC721_INTERFACE_ID,
  ERC721_METADATA_INTERFACE_ID,
} from '../../../src/constants/interfaces';
import { ERC165IdCalc, ERC165IdCalc__factory } from '../../../types/contracts';
import { INITIALIZER } from '../../helpers/Accounts';

interface InterfaceTest {
  name: string;
  interfaceId: Erc165InterfaceId;
  calcInterfaceId: (idCalc: ERC165IdCalc) => Promise<Erc165InterfaceId>;
}

const interfaceTests: InterfaceTest[] = [
  {
    name: 'AccessControl',
    interfaceId: ACCESS_CONTROL_INTERFACE_ID,
    calcInterfaceId: (idCalc) => idCalc.calcAccessControlInterfaceId(),
  },
  {
    name: 'ERC5484',
    interfaceId: ERC5484_INTERFACE_ID,
    calcInterfaceId: (idCalc) => idCalc.calcERC5484InterfaceId(),
  },
  {
    name: 'ERC721',
    interfaceId: ERC721_INTERFACE_ID,
    calcInterfaceId: (idCalc) => idCalc.calcERC721InterfaceId(),
  },
  {
    name: 'ERC721Enumerable',
    interfaceId: ERC721_ENUMERABLE_INTERFACE_ID,
    calcInterfaceId: (idCalc) => idCalc.calcERC721EnumerableInterfaceId(),
  },
  {
    name: 'ERC721Metadata',
    interfaceId: ERC721_METADATA_INTERFACE_ID,
    calcInterfaceId: (idCalc) => idCalc.calcERC721MetadataInterfaceId(),
  },
];

describe('ERC165 calculations', () => {
  interfaceTests.forEach(({ name, interfaceId, calcInterfaceId }) =>
    it(`should match ${name} interface id`, async () => {
      const idCalc = await new ERC165IdCalc__factory(INITIALIZER).deploy();

      expect(await calcInterfaceId(idCalc)).to.eq(interfaceId);
    }),
  );

  it('should not have any duplicates', () => {
    const interfaceIds = interfaceTests.map((it) => it.interfaceId);
    const interfaceSet = new Set(interfaceIds);

    expect(interfaceIds.length).to.eq(interfaceSet.size);
  });
});
