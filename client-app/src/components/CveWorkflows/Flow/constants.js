/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */

import { MarkerType } from "reactflow";

const INITIAL_TOP = 100;
const NODE_HEIGHT = 100;

const leftPositions = {
  lev1: 0,
  lev2: 200,
  lev3: 400,
  lev4: 550,
  lev5: 750,
  lev6: 940,
  lev7: 1165
}

const topPositions = {
  lev1: 0,
  lev2: 50,
  lev3: 100,
  lev4: 150,
  lev5: 200
}

const nodeIds = {
  cve_submitted: 'cve_submitted',
  assessment: 'assessment',
  mitigate: 'mitigate',
  upgrade: 'upgrade',
  patch: 'patch',
  false_positive: 'false_positive',
  review: 'review',
  approve_change: 'approve_change',
  publish: 'publish',
  trigger_change: 'trigger_change',
  confirm_remediation: 'confirm_remediation',
  close: 'close'
}

export const CVE_NODES = [
  {
    id: nodeIds.cve_submitted,
    type: 'component',
    data: {
      component: {
        name: 'CVE Submitted',
        id: nodeIds.cve_submitted,
        isSource: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev1,
      y: INITIAL_TOP
    }
  },
  {
    id: nodeIds.assessment,
    type: 'component',
    data: {
      component: {
        name: 'Assessment',
        id: nodeIds.assessment,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev2,
      y: INITIAL_TOP
    }
  },
  {
    id: nodeIds.mitigate,
    type: 'component',
    data: {
      component: {
        name: 'Mitigate',
        id: nodeIds.mitigate,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev3,
      y: topPositions.lev1
    }
  },
  {
    id: nodeIds.upgrade,
    type: 'component',
    data: {
      component: {
        name: 'Upgrade',
        id: nodeIds.upgrade,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev3,
      y: topPositions.lev3
    }
  },
  {
    id: nodeIds.patch,
    type: 'component',
    data: {
      component: {
        name: 'Patch',
        id: nodeIds.patch,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev3,
      y: topPositions.lev5
    }
  },
  {
    id: nodeIds.false_positive,
    type: 'component',
    data: {
      component: {
        name: 'False Positive',
        id: nodeIds.false_positive,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev4,
      y: topPositions.lev2
    }
  },
  {
    id: nodeIds.review,
    type: 'component',
    data: {
      component: {
        name: 'Review / Acceptance',
        id: nodeIds.review,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev5 - 25,
      y: topPositions.lev2
    }
  },
  {
    id: nodeIds.approve_change,
    type: 'component',
    data: {
      component: {
        name: 'Approve change',
        id: nodeIds.approve_change,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev4,
      y: topPositions.lev4
    }
  },
  {
    id: nodeIds.publish,
    type: 'component',
    data: {
      component: {
        name: 'Publish & URL',
        id: nodeIds.publish,
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev6,
      y: topPositions.lev1
    }
  },
  {
    id: nodeIds.trigger_change,
    type: 'component',
    data: {
      component: {
        name: 'Trigger change',
        id: nodeIds.trigger_change,
        subText: '(automate)',
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev5,
      y: topPositions.lev4
    }
  },
  {
    id: nodeIds.confirm_remediation,
    type: 'component',
    data: {
      component: {
        name: 'Confirm remediation',
        id: nodeIds.confirm_remediation,
        subText: '(Re-scan)',
        isSource: true,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev6,
      y: topPositions.lev4
    }
  },
  {
    id: nodeIds.close,
    type: 'component',
    data: {
      component: {
        name: 'Close',
        id: nodeIds.close,
        isTarget: true
      },
      style: {
        height: NODE_HEIGHT
      }
    },
    position: {
      x: leftPositions.lev7,
      y: INITIAL_TOP
    }
  },
]

const edgesDef = [
  {
    source: nodeIds.cve_submitted,
    target: nodeIds.assessment
  },
  {
    source: nodeIds.assessment,
    target: nodeIds.mitigate
  },
  {
    source: nodeIds.assessment,
    target: nodeIds.upgrade
  },
  {
    source: nodeIds.assessment,
    target: nodeIds.patch
  },
  {
    source: nodeIds.mitigate,
    target: nodeIds.false_positive
  },
  {
    source: nodeIds.mitigate,
    target: nodeIds.approve_change
  },
  {
    source: nodeIds.mitigate,
    target: nodeIds.publish
  },
  {
    source: nodeIds.upgrade,
    target: nodeIds.approve_change
  },
  {
    source: nodeIds.patch,
    target: nodeIds.approve_change
  },
  {
    source: nodeIds.false_positive,
    target: nodeIds.review
  },
  {
    source: nodeIds.approve_change,
    target: nodeIds.trigger_change
  },
  {
    source: nodeIds.review,
    target: nodeIds.publish
  },
  {
    source: nodeIds.trigger_change,
    target: nodeIds.confirm_remediation
  },
  {
    source: nodeIds.publish,
    target: nodeIds.close
  },
  {
    source: nodeIds.confirm_remediation,
    target: nodeIds.close
  }
]

export const CVE_EDGES = edgesDef.map(({ source, target }) => {
  return {
    id: `${source}-${target}`,
    source,
    sourceHandle: `${source}~right`,
    target,
    focusable: false,
    markerEnd: {
      type: MarkerType.ArrowClosed
    }
  }
})
