---
id: jvm-xml-xxe
title: Disable DOCTYPEs and external entities on every XML parser that reads input
impact: CRITICAL
impactDescription: "uploaded XML reads local files (/etc/passwd, credentials) or makes server-side requests"
roles: [implementer, reviewer, security]
check: "rg -n 'DocumentBuilderFactory.newInstance|SAXParserFactory.newInstance|XMLInputFactory.newInstance|TransformerFactory.newInstance' --type java --type kotlin"
tags: xml, xxe
---
Source: uploaded or fetched XML (SAML, SOAP, SVG, DOCX). Sink: a JAXP parser with default settings, which resolves external entities. Set the feature on the factory before creating the parser, every time; a shared hardened factory is fine.

**Incorrect:**

```java
var doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(upload);
```

**Correct:**

```java
var dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);
var doc = dbf.newDocumentBuilder().parse(upload);
```

For StAX: `xif.setProperty(XMLInputFactory.SUPPORT_DTD, false)`.

Reference: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html
