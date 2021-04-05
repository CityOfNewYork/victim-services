import decorations from '../src/js/decorations'
import OlFeature from 'ol/Feature';
import {notAccessibleFeature, accessibleFeature, otherFeature} from './features.mock'
import nyc from 'nyc-lib/nyc'
import fields from '../src/js/fields'
import Collapsible from 'nyc-lib/nyc/Collapsible'

jest.mock('nyc-lib/nyc/Collapsible')

describe('decorations', () => {
    let container
    beforeEach(() => {
      container = $('<div></div>')
      $('body').append(container)
      Collapsible.mockReset()
    })
    afterEach(() => {
      container.remove()
    })

  test('extendFeature', () => {
    expect.assertions(11)
    accessibleFeature.extendFeature()
    otherFeature.extendFeature()
    
    expect(accessibleFeature.locationKey).toBe(`${accessibleFeature.get('X')}@${accessibleFeature.get('Y')}`)
    expect(accessibleFeature.get('search_label')).toBe(
      `<span class="srch-lbl-lg${accessibleFeature.get('WHEELCHAIR_ACCESS') == '1' ? 1 : 0}${accessibleFeature.get('LOCATION_NAME').toLowerCase().indexOf('family justice center') > -1 ? '1' : '0'}">${accessibleFeature.get('ORGANIZATION_NAME')}</span><br>
      <span class="srch-lbl-sm">${accessibleFeature.get('LOCATION_NAME')}</span>`)
    expect(otherFeature.get('search_label')).toBe(
      `<span class="srch-lbl-lg00">${otherFeature.get('ORGANIZATION_NAME')}</span><br>
      <span class="srch-lbl-sm">${otherFeature.get('LOCATION_NAME')}</span>`)

    expect(accessibleFeature.get('other_languages')).toBe(`${accessibleFeature.get('OTHER_LANGUAGE') !== '' ? '1' : ''}`)
    expect(otherFeature.get('other_languages')).toBe('')
    
    expect(accessibleFeature.get('fjc')).toBe(`${accessibleFeature.get('LOCATION_NAME').toLowerCase().indexOf('family justice center') > -1 ? '1' : ''}`)
    
    const point = accessibleFeature.getGeometry()
    const xy = point.getCoordinates()

    expect(point.containsXY(xy[0],xy[1])).toBe(true)
    expect(point.containsXY(xy[0],3)).toBe(false)
    expect(point.containsXY(2,xy[1])).toBe(false)
    expect(point.containsXY(0,3)).toBe(false)

    accessibleFeature.extendFeature()
    
    expect(accessibleFeature.countByLocation[accessibleFeature.locationKey]).toBe(2)  

  })
  test('getCountAtLocation', () => {
    expect.assertions(1)
    accessibleFeature.countByLocation[accessibleFeature.locationKey] = 0

    accessibleFeature.extendFeature()
    accessibleFeature.extendFeature()
    accessibleFeature.extendFeature()
    
    expect(accessibleFeature.getCountAtLocation()).toBe(3)  

  })

  test('getAddress1', () => {
    expect.assertions(2)
    expect(accessibleFeature.getAddress1()).toBe(`${accessibleFeature.get('ADDRESS_1')}`)
    expect(accessibleFeature.getAddress1()).not.toBeNull()
  })

  test('getBorough', () => {
    expect.assertions(2)
    expect(accessibleFeature.getBorough()).toBe(`${accessibleFeature.get('BOROUGH')}`)
    expect(accessibleFeature.getBorough()).not.toBeNull()
  })

  test('getCityStateZip', () => {
    expect.assertions(2)
    expect(accessibleFeature.getCityStateZip()).toBe(`${accessibleFeature.get('ADDRESS_2')}`)
    expect(accessibleFeature.getCityStateZip()).not.toBeNull()
    
  })

  test('getName', () => {
    expect.assertions(2)
    expect(accessibleFeature.getName()).toBe(`${accessibleFeature.get('ORGANIZATION_NAME')}`)
    expect(accessibleFeature.getName()).not.toBeNull()
    
  })

  test('getPhone', () => {
    expect.assertions(2)
    expect(accessibleFeature.getPhone()).toBe(`${accessibleFeature.get('PHONE')}`)
    expect(accessibleFeature.getPhone()).not.toBeNull()
    
  })

  test('getWebsite', () => {
    expect.assertions(2)
    expect(accessibleFeature.getWebsite()).toBe(`${accessibleFeature.get('WEBSITE')}`)
    expect(accessibleFeature.getWebsite()).not.toBeNull()
    
  })

  test('getAccessible', () => {
    expect.assertions(2)
    expect(accessibleFeature.getAccessible()).toEqual(1)
    expect(notAccessibleFeature.getAccessible()).toBe('')
    
  })

  test('getFJC', () => {
    expect.assertions(1)
    accessibleFeature.extendFeature()
    expect(accessibleFeature.getFJC()).toBe(`${accessibleFeature.get('fjc')}`)
    
  })

  test('locationHtml', () => {
    expect.assertions(1)
    expect(accessibleFeature.locationHtml()).toEqual($(`<div class="location notranslate" translate="no">${accessibleFeature.get('LOCATION_NAME')}</div>`))
    
  })

  describe('detailsHtml', () => {
    const culturalHtml = accessibleFeature.culturalHtml
    const servicesHtml = accessibleFeature.servicesHtml
    const languagesHtml = accessibleFeature.languagesHtml
    beforeEach(() => {
      accessibleFeature.culturalHtml = jest.fn().mockImplementation(() => {
        return $('<div>mockCompetencies</div>')
      })
      accessibleFeature.languagesHtml = jest.fn().mockImplementation(() => {
        return $('<div>mockLanguages</div>')
      })
      accessibleFeature.servicesHtml = jest.fn().mockImplementation(() => {
        return $('<div>mockServices</div>')
      })
    })
    afterEach(() => {
      accessibleFeature.culturalHtml = culturalHtml
      accessibleFeature.servicesHtml = servicesHtml
      accessibleFeature.languagesHtml = languagesHtml
    })
    test('detailsHtml', () => {
      expect.assertions(1)
      expect(accessibleFeature.detailsHtml().html()).toBe('<div class=\"hours\"><div class=\"name\">Hours of operation:</div><div>Monday - Friday: 9 am - 5 pm<div></div></div> (Saturday: 8 am - 8 pm)</div><div class=\"eligibility\"><div class=\"name\">Eligibility criteria:</div>Serves NYC Residents Only</div><div class=\"referral\"><div class=\"name\">Referral required:</div><div>Self-Referral</div></div><div>mockServices</div><div>mockLanguages</div><div>mockCompetencies</div>')
    })
  })

  test('hoursHtml', () => {
    expect.assertions(3)
    expect(accessibleFeature.hoursHtml()).toEqual($('<div class="hours"><div class="name">Hours of operation:</div><div>Monday - Friday: 9 am - 5 pm<div></div></div> (Saturday: 8 am - 8 pm)</div>'))
    
    expect(notAccessibleFeature.hoursHtml()).toEqual($('<div class="hours"><div class="name">Hours of operation:</div><div>Monday - Friday: 9 am - 5 pm<div></div></div>'))

    expect(otherFeature.hoursHtml()).toBe(undefined)

  })

  test('eligibilityHtml', () => {
    expect.assertions(2)
    expect(accessibleFeature.eligibilityHtml()).toEqual($('<div class="eligibility"><div class="name">Eligibility criteria:</div>Serves NYC Residents Only</div>'))

    expect(notAccessibleFeature.eligibilityHtml()).toEqual(undefined)
  })


  describe('collapsible', () => {
    const getContainer = Collapsible.prototype.getContainer
    beforeEach(() => {
      Collapsible.prototype.getContainer = jest.fn(() => {
        return 'collapsible-container'
      })
    })
    afterEach(() => {
      Collapsible.prototype.getContainer = getContainer
    })
    test('collapsible', () => {
      const content = $('<div>Collapsible Content</div>')
      expect(accessibleFeature.collapsible('Collapsible Title', content)).toBe('collapsible-container')
      expect(Collapsible.mock.calls.length).toBe(1)
      expect(Collapsible.mock.calls[0][0].target).toEqual($('<div class="sub-clps"></div>'))
      expect(Collapsible.mock.calls[0][0].collapsed).toBe(true)
      expect(Collapsible.mock.calls[0][0].title).toBe('Collapsible Title')
      expect(Collapsible.mock.calls[0][0].content).toBe(content)
    })
  })
  describe('uses collapsible' , () => {
    const collapsible = accessibleFeature.collapsible
    beforeEach(() => {
      accessibleFeature.collapsible = jest.fn(() => {
        return 'collapsible-content'
      })
    })
    afterEach(() => {
      accessibleFeature.collapsible = collapsible
    })
    describe('servicesHtml', () => {
      const makeList = accessibleFeature.makeList
      const result = $('<div class="services"><div class="name">Services offered:</div><ul><li>mockService<li></ul></div>')
      beforeEach(() => {
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul><li>mockService<li></ul>')
        })
      })
      afterEach(() => {
        accessibleFeature.makeList = makeList
      })
      test('servicesHtml', () => {
        expect.assertions(7)
        accessibleFeature.extendFeature()
  
        expect(accessibleFeature.servicesHtml()).toEqual('collapsible-content')
        expect(accessibleFeature.collapsible.mock.calls[0][0]).toBe('Services offered')
        expect(accessibleFeature.collapsible.mock.calls[0][1]).toEqual($('<ul><li>mockService<li></ul>'))
        expect(accessibleFeature.makeList).toHaveBeenCalledTimes(1)
        expect(accessibleFeature.makeList.mock.calls[0][0]).toBe(fields.services)
        expect(accessibleFeature.makeList.mock.calls[0][1]).toBe(accessibleFeature.get('OTHER_SERVICE'))
    
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul></ul>')
        })
        accessibleFeature.extendFeature()
        expect(accessibleFeature.servicesHtml()).toBe(undefined)
  
      })  
    })
    describe('languagesHtml', () => {
      const makeList = accessibleFeature.makeList
      const result = $('<div class="languages"><div class="name">Languages offered:</div><ul><li>mockLanguage<li></ul></div>')
      beforeEach(() => {
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul><li>mockLanguage<li></ul>')
        })
      })
      afterEach(() => {
        accessibleFeature.makeList = makeList
      })
      test('languagesHtml', () => {
        expect.assertions(7)
        accessibleFeature.extendFeature()
  
        expect(accessibleFeature.languagesHtml()).toEqual('collapsible-content')
        expect(accessibleFeature.collapsible.mock.calls[0][0]).toBe('Languages offered')
        expect(accessibleFeature.collapsible.mock.calls[0][1]).toEqual($('<ul><li>mockLanguage<li></ul>'))
        expect(accessibleFeature.makeList).toHaveBeenCalledTimes(1)
        expect(accessibleFeature.makeList.mock.calls[0][0]).toBe(fields.languages)
        expect(accessibleFeature.makeList.mock.calls[0][1]).toBe(accessibleFeature.get('OTHER_LANGUAGE'))
    
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul></ul>')
        })
        accessibleFeature.extendFeature()
        expect(accessibleFeature.languagesHtml()).toBe(undefined)
        
      })  
    })
  
    describe('culturalHtml', () => {
      const makeList = accessibleFeature.makeList
      const result = $('<div class="cultural"><div class="name">Cultural competency specializations:</div><ul><li>mockCompetencies<li></ul></div>')
      beforeEach(() => {
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul><li>mockCompetencies<li></ul>')
        })
      })
      afterEach(() => {
        accessibleFeature.makeList = makeList
      })
      test('culturalHtml', () => {
        expect.assertions(6)
        accessibleFeature.extendFeature()
    
        expect(accessibleFeature.culturalHtml()).toEqual('collapsible-content')
        expect(accessibleFeature.collapsible.mock.calls[0][0]).toBe('Cultural competencies')
        expect(accessibleFeature.collapsible.mock.calls[0][1]).toEqual($('<ul><li>mockCompetencies<li></ul>'))
        expect(accessibleFeature.makeList).toHaveBeenCalledTimes(1)
        expect(accessibleFeature.makeList.mock.calls[0][0]).toBe(fields.competencies)
  
        accessibleFeature.makeList = jest.fn().mockImplementation(() => {
          return $('<ul></ul>')
        })
        accessibleFeature.extendFeature()
        expect(accessibleFeature.culturalHtml()).toBe(undefined)
      })
    })
  })

  test('referralHtml', () => {
    expect.assertions(2)
    expect(accessibleFeature.referralHtml()).toEqual($('<div class="referral"><div class="name">Referral required:</div><div>Self-Referral</div></div>'))
    expect(notAccessibleFeature.referralHtml()).toEqual(undefined)
  
  })
  
})

describe('Accessible facilities', () => {
  let container
  beforeEach(() => {
    container = $('<h3></h3>')
    $('body').append(container)
  })
  afterEach(() => {
    container.remove()
  })

  test('nameHtml isAccessible & fjc', () => {
    expect.assertions(1)

    const div = $('<div></div>')

    div.html(accessibleFeature.nameHtml())

    expect(div.html()).toBe('<h3 class="name notranslate accessible fjc">Organization</h3><div class="location notranslate" translate="no">Brooklyn Family Justice Center<div class="screen-reader-only"> - this is a wheelchair accessible facility</div><div class="screen-reader-only"> - this is a family justice center</div></div>')
  })

  test('nameHtml isNotAccessible', () => {
    expect.assertions(1)

    const div = $('<div></div>')

    div.html(notAccessibleFeature.nameHtml())
    expect(div.html()).toBe('<h3 class="name notranslate">Organization 2</h3><div class="location notranslate" translate="no">Organization 2 Center</div>')
  })

})


test('phoneHtml with ext', () => {
  expect.assertions(2)


  expect(accessibleFeature.phoneButton()).toEqual($('<a class="btn rad-all phone notranslate" href="tel:800-888-8888,1111" translate="no" role="button">800-888-8888 ext. 1111</a>'))
  
  
  let button = false
  expect(accessibleFeature.phoneHtml(button)).toEqual($('<span>800-888-8888 ext. 1111</span>'))

})

test('phoneHtml no ext', () => {
  expect.assertions(2)


  expect(notAccessibleFeature.phoneButton()).toEqual($('<a class="btn rad-all phone notranslate" href="tel:800-888-8888" translate="no" role="button">800-888-8888</a>'))

  let button = false
  expect(notAccessibleFeature.phoneHtml(button)).toEqual($('<span>800-888-8888</span>'))

})

test('phoneHtml undefined', () => {
  expect.assertions(1)

  expect(otherFeature.phoneHtml()).toBe(undefined)

})

test('makeList', () => {
  expect.assertions(6)
  let ul
  let other = 'other item'
  const items = {
    'ITEM-WITH-DASHES': 'Item With Dashes', 
    'ITEM_WITH_UNDERSCORES': 'Item With Underscores'
  }

  accessibleFeature.set(Object.keys(items)[0], 1)
  accessibleFeature.set(Object.keys(items)[1], 1)
  
  ul = accessibleFeature.makeList(items, '')
  expect(ul.children().length).toBe(Object.keys(items).length)
  expect(ul).toEqual($('<ul><li>Item With Dashes</li><li>Item With Underscores</li></ul>'))
  
  ul = accessibleFeature.makeList(items, other)

  expect(ul.children().length).toBe(Object.keys(items).length + 1)  
  expect(ul).toEqual($('<ul><li>Item With Dashes</li><li>Item With Underscores</li><li>other item</li></ul>'))

  accessibleFeature.unset(Object.keys(items)[0])
  accessibleFeature.unset(Object.keys(items)[1])

  let mockItems = ['mockLanguage']
  ul = accessibleFeature.makeList(mockItems, '')
  expect(ul.children().length).toBe(0)  
  expect(ul).toEqual($('<ul></ul>'))

})