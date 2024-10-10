import anvil
from random import choice
from nbt import nbt
from faker import Factory
from items import *
import base64

def createBlankRegion(cX,cY):
    region = anvil.EmptyRegion(cX, cY)
    for x in range(32):
        for y in range(32):
            chunkX = cX * 32 + x
            chunkY = cY * 32 + y
            chunk = anvil.EmptyChunk(chunkX, chunkY)
            # Add an air block at y=2
            for x in range(16):
                for z in range(16):
                    chunk.set_block(anvil.Block('minecraft', 'air'), x, 2, z)
            region.add_chunk(chunk)
    return region


def createChunk(cX,cY):
    chunk = anvil.EmptyChunk(cX, cY)
    for x in range(16):
       for z in range(16):
            # Pick a random wool color 
            chunk.set_block(randomWool(), x, 1, z)
            chunk.set_block(bedrock, x, 0, z)

    return chunk


def randomWool():
    block = anvil.Block('minecraft', choice(wool_colors))
    return block

def randomGlass():
    block = anvil.Block('minecraft', choice(glass_colors))
    return block

# Clear all other regions
for x in range(-1, 1):
    for y in range(-1, 1):
        region = createBlankRegion(x, y)
        region.save(f'r.{x}.{y}.mca')


# Create a new region with the `EmptyRegion` class at 0, 0 (in region coords)

# Create a new chunk at 0, 0 (in chunk coords)

# Set the chunk's blocks to a random blocks
bedrock = anvil.Block('minecraft', 'bedrock')

# All wool colors
wool_colors = ['white_wool', 'orange_wool', 'magenta_wool', 'light_blue_wool', 'yellow_wool', 'lime_wool', 'pink_wool', 'gray_wool', 'light_gray_wool', 'cyan_wool', 'purple_wool', 'blue_wool', 'brown_wool', 'green_wool', 'red_wool', 'black_wool']

glass_colors = ['white_stained_glass', 'orange_stained_glass', 'magenta_stained_glass', 'light_blue_stained_glass', 'yellow_stained_glass', 'lime_stained_glass', 'pink_stained_glass', 'gray_stained_glass', 'light_gray_stained_glass', 'cyan_stained_glass', 'purple_stained_glass', 'blue_stained_glass', 'brown_stained_glass', 'green_stained_glass', 'red_stained_glass', 'black_stained_glass']

shulker_blocks = ['shulker_box', 'white_shulker_box', 'orange_shulker_box', 'magenta_shulker_box', 'light_blue_shulker_box', 'yellow_shulker_box', 'lime_shulker_box', 'pink_shulker_box', 'gray_shulker_box', 'light_gray_shulker_box', 'cyan_shulker_box', 'purple_shulker_box', 'blue_shulker_box', 'brown_shulker_box', 'green_shulker_box', 'red_shulker_box', 'black_shulker_box']

shulker_blocks.remove('shulker_box')
shulker_blocks.remove('pink_shulker_box')

book_colours = ['black', 'dark_blue', 'dark_green', 'dark_aqua', 'dark_red', 'dark_purple', 'gold', 'gray', 'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple', 'yellow', 'white']

book_colours.remove('gold')

flag = "Intake24{Cub3s_Ar3_C0l0urfu1}"

def encodeFlag(flag):
    # Base 64 encode the flag
    flag = base64.b64encode(flag.encode()).decode()
    print(len(flag))
    # Convert the flag to a list of integers
    encoded = []
    for c in flag:
        minecraftBlock = ''
        for item in allGameItems:
            if item.id == int(ord(c)):
                minecraftBlock = item.displayName
                break
        if minecraftBlock == '':
            print('No block found for ', c)
            print("Try a different flag")
            exit()
        encoded.append(minecraftBlock)
    return encoded

encodedFlag = encodeFlag(flag)
numFlagBlocks = len(encodedFlag)

class container:
    def __init__(self, x, y, z, items, name=None):
        self.x = x
        self.y = y
        self.z = z
        self.items = items
        self.name = name

    def getNbt(self):
        contaienrNBT = nbt.TAG_Compound()
        contaienrNBT.name = 'BlockEntityTag'
        contaienrNBT.tags.append(nbt.TAG_Byte(name='keepPacked', value=0))
        contaienrNBT.tags.append(nbt.TAG_Int(name='x', value=self.x))
        contaienrNBT.tags.append(nbt.TAG_Int(name='y', value=self.y))
        contaienrNBT.tags.append(nbt.TAG_Int(name='z', value=self.z))
        itemsTag = nbt.TAG_List(type=nbt.TAG_Compound, name='Items')
        for i, item in enumerate(items):
            itemTag = item.getNbt()
            itemTag.tags.append(nbt.TAG_Byte(name='Slot', value=i))
            itemsTag.tags.append(itemTag)
       
        contaienrNBT.tags.append(itemsTag)
        if self.name:
            contaienrNBT.tags.append(nbt.TAG_String(name='CustomName', value='{"text":"'+self.name+'"}'))
        return contaienrNBT

class chest(container):
    def __init__(self, x, y, z, items, name=None):
        super().__init__(x, y, z, items, name)

    def getNbt(self):
        contaienrNBT = super().getNbt()
        contaienrNBT.tags.append(nbt.TAG_String(name='id', value='minecraft:chest'))
        return contaienrNBT

class shulkerBox(container):
    def __init__(self, x, y, z, items, name=None):
        super().__init__(x, y, z, items, name)

    def getNbt(self):
        contaienrNBT = super().getNbt()
        contaienrNBT.tags.append(nbt.TAG_String(name='id', value='minecraft:shulker_box'))
        return contaienrNBT

class item:
    def __init__(self, id, count, name=None):
        self.id = id
        self.count = count
        self.tags = []
        self.name = name

    def getNbt(self):
        itemNBT = nbt.TAG_Compound()
        itemNBT.tags.append(nbt.TAG_String(name='id', value=self.id))
        itemNBT.tags.append(nbt.TAG_Byte(name='Count', value=self.count))
        return itemNBT

# Class written book extends item
class writtenBook(item):
    def __init__(self, title, author, pages, generation=0):
        self.title = title
        self.author = author
        self.pages = pages
        self.generation = generation

        self.id = 'minecraft:written_book'
        self.count = 1
        self.tags = []
    

    def getNbt(self):
        main = super().getNbt()
        tags = nbt.TAG_Compound(name='tag')
        tags.tags.append(nbt.TAG_String(name='title', value=self.title))
        tags.tags.append(nbt.TAG_String(name='author', value=self.author))
        tags.tags.append(nbt.TAG_Int(name='generation', value=self.generation))
        pagesTag = nbt.TAG_List(type=nbt.TAG_String, name='pages')
        for i, page in enumerate(self.pages):
            pageTag = page.getNbt()
            pagesTag.tags.append(pageTag)
        tags.tags.append(pagesTag)
        main.tags.append(tags)
        return main

class page():
    def __init__(self, text, color='black'):
        self.text = text
        self.color = color

    def getNbt(self):
        return nbt.TAG_String(value='{"text":"'+self.text+'", "color":"' + self.color + '"}')



faker = Factory.create()


def randomContainer(flagBook=False, boxID=0):
    items = []
    for x in range(27):
        if x != 13:
            items.append(item('minecraft:'+choice(allGameItems).name, 1))
        else:
            if flagBook:
                extra = encodedFlag[boxID]
                items.append(writtenBook(faker.name(), faker.name(), randomPages(True, extra), boxID))
            else:
                items.append(writtenBook(faker.name(), faker.name(), randomPages(), choice(range(50))))
    return items


def randomPages(flagBook=False, extra=''):
    pages = []
    if flagBook:
        numPages = choice(range(3, 10))
    else:
        numPages = choice(range(1, 11))
    for x in range(numPages):
        pages.append(page(faker.sentence(), choice(book_colours)))
    if flagBook:
        pages.append(page(extra, 'gold'))
    return pages
        


#contaienrNBT = createChest(130, 3, 128, items)
#chunk.tile_entities.append(contaienrNBT)

region = anvil.EmptyRegion(0, 0)
for x in range(16):
    for y in range(16):
        chunk = createChunk(x, y)
        region.add_chunk(chunk)



center = (128,128)
for x in range(center[0]-25, center[0]+25):
    for z in range(center[1]-25, center[1]+25):
        for y in range(1, 15):
            chunk = region.get_chunk(x//16, z//16)
            if x == center[0]-25 or x == center[0]+24 or z == center[1]-25 or z == center[1]+24 or y == 1:
                chunk.set_block(randomWool(), x%16, y, z%16)
            elif y == 14:
                chunk.set_block(randomGlass(), x%16, y, z%16)
            elif y == 2:
                box = anvil.Block('minecraft', choice(shulker_blocks), properties={'facing': 'up'})
                chunk.set_block(box, x%16, y, z%16)


for boxID in range(numFlagBlocks):
    placed = False
    while not placed:
        x = choice(range(center[0]-24, center[0]+24))
        z = choice(range(center[1]-24, center[1]+24))
        y = 2
        chunk = region.get_chunk(x//16, z//16)
        currentBlock= chunk.get_block(x%16, y, z%16)
        if currentBlock.id != 'pink_shulker_box':
            placed = True
            box = anvil.Block('minecraft', 'pink_shulker_box', properties={'facing': 'up'})
            chunk.set_block(box, x%16, y, z%16)
            items = randomContainer(True, boxID)
            shulkerTag = shulkerBox(x, y, z, items, faker.name()).getNbt()
            chunk.tile_entities.append(shulkerTag)
        else: 
            print('Pink shulker already exists at ', x, z)

# Add random items to the rest of the chunk
for x in range(center[0]-24, center[0]+24):
    for z in range(center[1]-24, center[1]+24):
        chunk = region.get_chunk(x//16, z//16)
        # Check if the block is a pink shulker box
        currentBlock= chunk.get_block(x%16, 2, z%16)
        if currentBlock.id != 'pink_shulker_box':
            items = randomContainer()
            shulkerTag = shulkerBox(x, 2, z, items, faker.name()).getNbt()
            chunk.tile_entities.append(shulkerTag)

# Save the region to a file
region.save('r.0.0.mca')
