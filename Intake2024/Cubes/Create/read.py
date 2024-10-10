import anvil
import nbt

copiedRegion = anvil.EmptyRegion(0, 0)

def printChunk(chunk):
    for y in range(2,15):
        for x in range(16):
            for z in range(16):
                block = chunk.get_block(x, y, z)
                if block.id != 'air' and 'glass' not in block.id and 'wool' not in block.id:
                    print(f'Block at {x}, {y}, {z}: {block}')
                    print(block.properties)


def printRegion(region):
    for x in range(16):
        for z in range(16):
            chunk = region.get_chunk(x, z)
            printChunk(chunk)
            print(f'Chunk {x}, {z}:')
            for te in chunk.tile_entities:
                print(type(te))
                print(te)

def copyChunk(chunk):
    newChunk = anvil.EmptyChunk(chunk.x, chunk.z)
    for y in range(0,15):
        for x in range(16):
            for z in range(16):
                block = chunk.get_block(x, y, z)
                if block.properties:
                    newChunk.set_block(anvil.Block(block.namespace, block.id, block.properties), x, y, z)
                else:
                    newChunk.set_block(anvil.Block(block.namespace, block.id), x, y, z)
    return newChunk

def copyRegion(region):
    for x in range(16):
        for z in range(16):
            chunk = region.get_chunk(x, z)
            newChunk = copyChunk(chunk)
            newChunk.tile_entities = chunk.tile_entities
            copiedRegion.add_chunk(newChunk)

region = anvil.Region.from_file('r.0.0.mca')
#copyRegion(region)


# Save the copied Region
#copiedRegion.save('copiedRegion.mca')

#printRegion(region)

def printTag(tag, indent):
    print(" ")
    if type(tag) == nbt.nbt.TAG_Compound:
        print(" " * indent + "'" + str(tag) + "':")
        print(" " * indent + "{")
        for key in tag:
            print(" " * indent + "  '" + key + "':")
            printTag(tag[key], indent + 1)
        print(" " * indent + "}")
    elif type(tag) == nbt.nbt.TAG_List:
        print(" " * indent + "'" + str(tag) + "':")
        print(" " * indent + "[")
        for item in tag:
            printTag(item, indent + 1)
        print(" " * indent + "]")
    else:
        print(" " * indent + str(tag))

# Parse every chunk in the region
for x in range(16):
    for z in range(16):
        chunk = region.get_chunk(x, z)
        print(f'Chunk {x}, {z}:')
        printChunk(chunk)
        print("  ")
        print(chunk.tile_entities)
        for te in chunk.tile_entities:
            printTag(te,0)
